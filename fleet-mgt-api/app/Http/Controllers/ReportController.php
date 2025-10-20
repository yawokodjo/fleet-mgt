<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Models\Vehicle;
use App\Models\Consumption;
use App\Models\Maintenance;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\MonthlyReportExport;
use App\Exports\MonthlyReportViewExport;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    /**
     * 📋 Liste paginée des rapports
     */
    public function index(Request $request)
    {
        if (!Gate::any(['admin-action', 'manager-action', 'accountant-action'])) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $query = Report::with(['manager', 'vehicle', 'maintenance', 'consumption']);

        if ($request->filled('type')) {
            $query->where('report_type', $request->type);
        }

        if ($request->filled('manager_id')) {
            $query->where('manager_id', $request->manager_id);
        }

        if ($request->filled('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }

        $query->orderBy('date', $request->input('order', 'desc'));

        return $query->paginate($request->per_page ?? 15);
    }

    /**
     * ➕ Créer un rapport
     */
    public function store(Request $request)
    {
        if (!Gate::any(['admin-action', 'manager-action'])) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $data = $request->validate([
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'maintenance_id' => 'nullable|exists:maintenances,id',
            'consumption_id' => 'nullable|exists:consumptions,id',
            'date' => 'required|date',
            'report_type' => 'required|string',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'metadata' => 'nullable|json'
        ]);

        $data['manager_id'] = auth()->id();

        $report = Report::create($data);

        return response()->json($report, 201);
    }

    /**
     * 👁️ Voir un rapport
     */
    public function show(Report $report)
    {
        if (!Gate::any(['admin-action', 'manager-action', 'accountant-action'])) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        return $report->load(['manager', 'vehicle', 'maintenance', 'consumption']);
    }

    /**
     * ✏️ Modifier un rapport
     */
    public function update(Request $request, Report $report)
    {
        $canUpdate = Gate::allows('admin-action') ||
                     (Gate::allows('manager-action') && $report->manager_id === auth()->id());

        if (!$canUpdate) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $data = $request->validate([
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'maintenance_id' => 'nullable|exists:maintenances,id',
            'consumption_id' => 'nullable|exists:consumptions,id',
            'date' => 'sometimes|date',
            'report_type' => 'sometimes|string',
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'metadata' => 'nullable|json'
        ]);

        $report->update($data);

        return response()->json($report);
    }

    /**
     * ❌ Supprimer un rapport
     */
    public function destroy(Report $report)
    {
        $canDelete = Gate::allows('admin-action') ||
                     (Gate::allows('manager-action') && $report->manager_id === auth()->id());

        if (!$canDelete) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $report->delete();

        return response()->json(null, 204);
    }

    /**
     * ⚙️ Génération automatique de rapport (ex: résumé mensuel)
     */
    public function generateReport(Request $request)
    {
        if (!Gate::any(['admin-action', 'manager-action'])) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $type = $request->input('type', 'monthly_summary');
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        $reportData = $this->generateReportData($type, $startDate, $endDate);

        $report = Report::create([
            'manager_id' => auth()->id(),
            'date' => now(),
            'report_type' => $type,
            'title' => "Rapport généré: " . ucfirst(str_replace('_', ' ', $type)),
            'content' => $reportData['content'],
            'metadata' => $reportData['metadata']
        ]);

        return response()->json($report);
    }

    /**
     * 🧾 Rapport de consommation filtré entre 2 dates + tri + export PDF/Excel
     */
    public function exportBetweenDates(Request $request)
    {
        if (!Gate::any(['admin-action', 'manager-action', 'accountant-action'])) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $start = $request->input('start_date');
        $end = $request->input('end_date');
        $order = $request->input('order', 'asc');
        $format = $request->input('format', 'pdf');

        $consumptions = Consumption::whereBetween('date', [$start, $end])
            ->orderBy('date', $order)
            ->get();

        if ($consumptions->isEmpty()) {
            return response()->json(['message' => 'Aucune donnée trouvée'], 404);
        }

        $reportData = [
            'start' => $start,
            'end' => $end,
            'order' => $order,
            'consumptions' => $consumptions
        ];

        if ($format === 'excel') {
            return Excel::download(new MonthlyReportViewExport($start, $end, $order), "rapport_{$start}_{$end}.xlsx");
        } else {
            $pdf = Pdf::loadView('reports.monthly_consumption', $reportData);
            return $pdf->download("rapport_{$start}_{$end}.pdf");
        }
    }

    /**
     * 🔧 Logique interne de génération de rapport
     */
    private function generateReportData($type, $startDate, $endDate)
    {
        if ($type === 'monthly_summary') {
            return [
                'content' => "Rapport mensuel du $startDate au $endDate.",
                'metadata' => [
                    'vehicles_count' => Vehicle::count(),
                    'maintenances_count' => Maintenance::whereBetween('scheduled_date', [$startDate, $endDate])->count(),
                    'fuel_cost_total' => Consumption::whereBetween('date', [$startDate, $endDate])->sum('fuel_cost')
                ]
            ];
        }

        return [
            'content' => "Contenu du rapport généré automatiquement.",
            'metadata' => null
        ];
    }
}
