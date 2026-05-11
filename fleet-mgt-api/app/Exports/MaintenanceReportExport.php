<?php

namespace App\Exports;

use App\Models\Maintenance;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MaintenanceReportExport implements FromCollection, ShouldAutoSize, WithColumnWidths, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $startDate;
    protected $endDate;
    protected $order;
    protected $vehicleId;
    protected $rowNumber = 1;
    protected $data;

    public function __construct($startDate, $endDate, $order = 'asc', $vehicleId = null)
    {
        $this->startDate = $startDate;
        $this->endDate   = $endDate;
        $this->order     = $order;
        $this->vehicleId = $vehicleId;
        $this->data      = $this->getData();
    }

    private function getData()
    {
        $query = Maintenance::with(['vehicle', 'driver'])
            ->whereBetween('scheduled_date', [$this->startDate, $this->endDate]);

        if ($this->vehicleId) {
            $query->where('vehicle_id', $this->vehicleId);
        }

        return $query->orderBy('scheduled_date', $this->order)->get();
    }

    public function collection()
    {
        return $this->data;
    }

    // Colonnes : N° | Date prévue | Date réalisée | Véhicule | Type | Société | Coût | Statut | Description
    public function headings(): array
    {
        return [
            'N°',
            'Date prévue',
            'Date réalisée',
            'Véhicule',
            'Type de maintenance',
            'Société / Atelier',
            'Coût (FCFA)',
            'Statut',
            'Description',
        ];
    }

    public function map($maintenance): array
    {
        return [
            $this->rowNumber++,
            \Carbon\Carbon::parse($maintenance->scheduled_date)->format('d/m/Y'),
            $maintenance->completed_date
                ? \Carbon\Carbon::parse($maintenance->completed_date)->format('d/m/Y')
                : 'N/A',
            $maintenance->vehicle->license_plate ?? 'N/A',
            $maintenance->maintenance_type ?? 'N/A',
            $maintenance->maintenance_company ?? 'N/A',
            number_format($maintenance->cost ?? 0, 0, ',', ' '),
            $this->getStatusLabel($maintenance->status),
            $maintenance->description ?? '',
        ];
    }

    private function getStatusLabel($status): string
    {
        return [
            'planned'     => 'Planifié',
            'in_progress' => 'En cours',
            'completed'   => 'Terminé',
            'cancelled'   => 'Annulé',
        ][$status] ?? ucfirst($status ?? '');
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow    = $sheet->getHighestRow();
        $lastColumn = $sheet->getHighestColumn();

        // En-tête
        $sheet->getStyle('A1:'.$lastColumn.'1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 12],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0d6efd']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]],
        ]);

        // Données
        if ($lastRow > 1) {
            $sheet->getStyle('A2:'.$lastColumn.$lastRow)->applyFromArray([
                'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'CCCCCC']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            $sheet->getStyle('A2:C'.$lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('G2:G'.$lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle('H2:H'.$lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }

        // Ligne de total
        $totalRow  = $lastRow + 1;
        $totalCost = $this->data->sum('cost');

        $sheet->setCellValue('A'.$totalRow, 'TOTAL');
        $sheet->setCellValue('G'.$totalRow, number_format($totalCost, 0, ',', ' ').' FCFA');

        $sheet->getStyle('A'.$totalRow.':'.$lastColumn.$totalRow)->applyFromArray([
            'font'      => ['bold' => true, 'size' => 11],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E9ECEF']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '000000']]],
        ]);

        // Hauteurs
        $sheet->getRowDimension(1)->setRowHeight(25);
        for ($i = 2; $i <= $lastRow; $i++) {
            $sheet->getRowDimension($i)->setRowHeight(20);
        }
        $sheet->getRowDimension($totalRow)->setRowHeight(25);

        // Titre
        $sheet->insertNewRowBefore(1, 2);
        $sheet->mergeCells('A1:'.$lastColumn.'1');
        $sheet->setCellValue('A1', 'RAPPORT DE MAINTENANCE DES VEHICULES');
        $sheet->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 16, 'color' => ['rgb' => '0d6efd']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(30);

        // Période
        $sheet->insertNewRowBefore(2, 1);
        $sheet->mergeCells('A2:'.$lastColumn.'2');
        $period = 'Période : '.\Carbon\Carbon::parse($this->startDate)->format('d/m/Y').
                  ' au '.\Carbon\Carbon::parse($this->endDate)->format('d/m/Y');
        if ($this->vehicleId) {
            $vehicle = \App\Models\Vehicle::find($this->vehicleId);
            if ($vehicle) {
                $period .= ' | Véhicule : '.$vehicle->license_plate;
            }
        }
        $period .= ' | '.$this->data->count().' enregistrement(s)';
        $sheet->setCellValue('A2', $period);
        $sheet->getStyle('A2')->applyFromArray([
            'font'      => ['italic' => true, 'size' => 10, 'color' => ['rgb' => '6C757D']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(20);

        $sheet->freezePane('A4');

        return $sheet;
    }

    public function title(): string
    {
        return 'Rapport Maintenance';
    }

    public function columnWidths(): array
    {
        return [
            'A' => 6,
            'B' => 14,
            'C' => 14,
            'D' => 15,
            'E' => 22,
            'F' => 25,
            'G' => 16,
            'H' => 12,
            'I' => 40,
        ];
    }
}
