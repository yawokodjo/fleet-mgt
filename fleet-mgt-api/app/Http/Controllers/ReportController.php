<?php

namespace App\Http\Controllers;

use App\Exports\ConsumptionReportExport;
use App\Exports\MaintenanceReportExport;
use App\Models\Consumption;
use App\Models\Maintenance;
use App\Models\Report;
use App\Models\Vehicle;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    /**
     * 📋 Liste paginée des rapports
     */
    public function index(Request $request)
    {
        /*  if (!Gate::any(['admin-action', 'manager-action', 'accountant-action'])) {
              return response()->json(['message' => 'Accès non autorisé'], 403);
          } */

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
        /* if (!Gate::any(['admin-action', 'manager-action'])) {
             return response()->json(['message' => 'Accès non autorisé'], 403);
         } */

        $data = $request->validate([
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'maintenance_id' => 'nullable|exists:maintenances,id',
            'consumption_id' => 'nullable|exists:consumptions,id',
            'date' => 'required|date',
            'report_type' => 'required|string',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'metadata' => 'nullable|json',
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
        /*  if (!Gate::any(['admin-action', 'manager-action', 'accountant-action'])) {
              return response()->json(['message' => 'Accès non autorisé'], 403);
          } */

        return $report->load(['manager', 'vehicle', 'maintenance', 'consumption']);
    }

    /**
     * ✏️ Modifier un rapport
     */
    public function update(Request $request, Report $report)
    {
        /*  $canUpdate = Gate::allows('admin-action') ||
                      (Gate::allows('manager-action') && $report->manager_id === auth()->id());

         if (!$canUpdate) {
             return response()->json(['message' => 'Accès non autorisé'], 403);
         } */

        $data = $request->validate([
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'maintenance_id' => 'nullable|exists:maintenances,id',
            'consumption_id' => 'nullable|exists:consumptions,id',
            'date' => 'sometimes|date',
            'report_type' => 'sometimes|string',
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'metadata' => 'nullable|json',
        ]);

        $report->update($data);

        return response()->json($report);
    }

    /**
     * ❌ Supprimer un rapport
     */
    public function destroy(Report $report)
    {
        /*  $canDelete = Gate::allows('admin-action') ||
                      (Gate::allows('manager-action') && $report->manager_id === auth()->id());

         if (!$canDelete) {
             return response()->json(['message' => 'Accès non autorisé'], 403);
         } */

        $report->delete();

        return response()->json(null, 204);
    }

    /**
     * ⚙️ Génération automatique de rapport (ex: résumé mensuel)
     */
    public function generateReport(Request $request)
    {
        /* if (!Gate::any(['admin-action', 'manager-action'])) {
             return response()->json(['message' => 'Accès non autorisé'], 403);
         } */

        $type = $request->input('type', 'monthly_summary');
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        $reportData = $this->generateReportData($type, $startDate, $endDate);

        $report = Report::create([
            'manager_id' => auth()->id(),
            'date' => now(),
            'report_type' => $type,
            'title' => 'Rapport généré: '.ucfirst(str_replace('_', ' ', $type)),
            'content' => $reportData['content'],
            'metadata' => $reportData['metadata'],
        ]);

        return response()->json($report);
    }

    /**
     * 🧾 Rapport de CONSOMMATION filtré entre 2 dates + véhicule + tri + export PDF/Excel/JSON
     */
    public function exportBetweenDates(Request $request)
    {
        /*  if (!Gate::any(['admin-action', 'manager-action', 'accountant-action'])) {
              return response()->json(['message' => 'Accès non autorisé'], 403);
          } */

        // Validation des paramètres
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'order' => 'nullable|in:asc,desc',
            'format' => 'nullable|in:json,pdf,excel',
        ]);

        $start = $validated['start_date'];
        $end = $validated['end_date'];
        $vehicleId = $request->input('vehicle_id');
        $order = $request->input('order', 'asc');
        $format = $request->input('format', 'json');

        // Construction de la requête avec filtre véhicule
        $query = Consumption::with('vehicle')
            ->whereBetween('date', [$start, $end]);

        if ($vehicleId) {
            $query->where('vehicle_id', $vehicleId);
        }

        $consumptions = $query->orderBy('date', $order)->get();

        // Format JSON (pour affichage dans le tableau React)
        if ($format === 'json') {
            return response()->json([
                'consumptions' => $consumptions->map(function ($c) {
                    // Calcul du taux de consommation
                    $consumptionRate = 0;
                    if ($c->kilometers && $c->kilometers > 0 && $c->quantity) {
                        $consumptionRate = round(($c->quantity / $c->kilometers) * 100, 2);
                    }

                    return [
                        'id' => $c->id,
                        'date' => $c->date,
                        'vehicle' => $c->vehicle->license_plate ?? 'N/A',
                        'vehicle_id' => $c->vehicle_id,
                        'quantity' => $c->quantity,
                        'unit_price' => $c->unit_price,
                        'fuel_cost' => $c->fuel_cost,
                        'kilometers' => $c->kilometers,
                        'consumption_rate' => $consumptionRate > 0 ? $consumptionRate : null,
                        'fuel_type' => $c->fuel_type,
                        'station' => $c->station,
                    ];
                }),
                'filters' => [
                    'start_date' => $start,
                    'end_date' => $end,
                    'vehicle_id' => $vehicleId,
                    'order' => $order,
                ],
                'totals' => [
                    'total_fuel' => round($consumptions->sum('quantity'), 2),
                    'total_cost' => $consumptions->sum('fuel_cost'),
                ],
            ]);
        }

        // Vérification si données disponibles pour export
        if ($consumptions->isEmpty()) {
            return response()->json(['message' => 'Aucune donnée trouvée pour cette période'], 404);
        }

        $reportData = [
            'start' => $start,
            'end' => $end,
            'order' => $order,
            'vehicle_id' => $vehicleId,
            'consumptions' => $consumptions,
        ];

        // Export Excel
        if ($format === 'excel') {
            return Excel::download(
                new ConsumptionReportExport($start, $end, $order, $vehicleId),
                "rapport_consommation_{$start}_{$end}.xlsx"
            );
        }

        // Export PDF
        $pdf = Pdf::loadView('reports.monthly_consumption', $reportData);

        return $pdf->download("rapport_consommation_{$start}_{$end}.pdf");
    }

    /**
     * 🔧 Rapport de MAINTENANCE filtré entre 2 dates + véhicule + tri + export PDF/Excel/JSON
     */
    public function maintenanceBetweenDates(Request $request)
    {
        /* if (!Gate::any(['admin-action', 'manager-action', 'accountant-action'])) {
             return response()->json(['message' => 'Accès non autorisé'], 403);
         } */

        // Validation des paramètres
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'order' => 'nullable|in:asc,desc',
            'format' => 'nullable|in:json,pdf,excel',
        ]);

        $start = $validated['start_date'];
        $end = $validated['end_date'];
        $vehicleId = $request->input('vehicle_id');
        $order = $request->input('order', 'asc');
        $format = $request->input('format', 'json');

        // Construction de la requête avec filtre véhicule
        $query = Maintenance::with('vehicle')
            ->whereBetween('scheduled_date', [$start, $end]);

        if ($vehicleId) {
            $query->where('vehicle_id', $vehicleId);
        }

        $maintenances = $query->orderBy('scheduled_date', $order)->get();

        // Format JSON (pour affichage dans le tableau React)
        if ($format === 'json') {
            return response()->json([
                'maintenances' => $maintenances->map(function ($m) {
                    return [
                        'id' => $m->id,
                        'date' => $m->scheduled_date,
                        'vehicle' => $m->vehicle->license_plate ?? 'N/A',
                        'vehicle_id' => $m->vehicle_id,
                        'type' => $m->maintenance_type,
                        'cost' => $m->cost,
                        'kilometers' => $m->current_mileage ?? $m->vehicle->mileage ?? 0,
                        'vendor' => $m->vendor ?? 'N/A',
                        'status' => $m->status,
                        'notes' => $m->notes ?? '',
                    ];
                }),
                'filters' => [
                    'start_date' => $start,
                    'end_date' => $end,
                    'vehicle_id' => $vehicleId,
                    'order' => $order,
                ],
                'totals' => [
                    'total_cost' => $maintenances->sum('cost'),
                    'count' => $maintenances->count(),
                ],
            ]);
        }

        // Vérification si données disponibles pour export
        if ($maintenances->isEmpty()) {
            return response()->json(['message' => 'Aucune donnée trouvée pour cette période'], 404);
        }

        $reportData = [
            'start' => $start,
            'end' => $end,
            'order' => $order,
            'vehicle_id' => $vehicleId,
            'maintenances' => $maintenances,
        ];

        // Export Excel
        if ($format === 'excel') {
            return Excel::download(
                new MaintenanceReportExport($start, $end, $order, $vehicleId),
                "rapport_maintenance_{$start}_{$end}.xlsx"
            );
        }

        // Export PDF
        $pdf = Pdf::loadView('reports.maintenance_report', $reportData);

        return $pdf->download("rapport_maintenance_{$start}_{$end}.pdf");
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
                    'fuel_cost_total' => Consumption::whereBetween('date', [$startDate, $endDate])->sum('fuel_cost'),
                ],
            ];
        }

        return [
            'content' => 'Contenu du rapport généré automatiquement.',
            'metadata' => null,
        ];
    }
}
