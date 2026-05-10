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

    public function __construct($startDate, $endDate, $order = 'asc', $vehicleId = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->order = $order;
        $this->vehicleId = $vehicleId;
    }

    /**
     * Récupération des données de maintenance
     */
    public function collection()
    {
        $query = Maintenance::with(['vehicle'])
            ->whereBetween('scheduled_date', [$this->startDate, $this->endDate]);

        if ($this->vehicleId) {
            $query->where('vehicle_id', $this->vehicleId);
        }

        return $query->orderBy('scheduled_date', $this->order)->get();
    }

    /**
     * En-têtes du tableau Excel
     */
    public function headings(): array
    {
        return [
            'N°',
            'Date',
            'Véhicule',
            'Type de maintenance',
            'Coût (FCFA)',
            'Kilométrage (Km)',
            'Fournisseur / Atelier',
            'Statut',
            'Remarques',
        ];
    }

    /**
     * Mapping des données pour chaque ligne
     */
    public function map($maintenance): array
    {
        return [
            $this->rowNumber++,
            \Carbon\Carbon::parse($maintenance->scheduled_date)->format('d/m/Y'),
            $maintenance->vehicle->license_plate ?? 'N/A',
            $maintenance->maintenance_type ?? 'N/A',
            number_format($maintenance->cost ?? 0, 0, ',', ' '),
            number_format($maintenance->current_mileage ?? $maintenance->vehicle->mileage ?? 0, 0, ',', ' '),
            $maintenance->vendor ?? 'N/A',
            $this->getStatusLabel($maintenance->status),
            $maintenance->notes ?? '',
        ];
    }

    /**
     * Traduction du statut
     */
    private function getStatusLabel($status): string
    {
        $labels = [
            'scheduled' => 'Planifié',
            'in_progress' => 'En cours',
            'completed' => 'Terminé',
            'cancelled' => 'Annulé',
        ];

        return $labels[$status] ?? ucfirst($status);
    }

    /**
     * Styles du tableau Excel
     */
    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();
        $lastColumn = $sheet->getHighestColumn();

        // Style de l'en-tête (ligne 1)
        $sheet->getStyle('A1:'.$lastColumn.'1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 12,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '0d6efd'], // Bleu Bootstrap primary
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);

        // Style des données (lignes 2 à n)
        if ($lastRow > 1) {
            $sheet->getStyle('A2:'.$lastColumn.$lastRow)->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'CCCCCC'],
                    ],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ]);

            // Centrer les colonnes numériques et dates
            $sheet->getStyle('A2:B'.$lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('E2:F'.$lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle('H2:H'.$lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }

        // Ajouter une ligne de total
        $totalRow = $lastRow + 1;
        $totalCost = 0;

        foreach ($this->collection() as $maintenance) {
            $totalCost += $maintenance->cost ?? 0;
        }

        $sheet->setCellValue('A'.$totalRow, 'TOTAL');
        $sheet->setCellValue('E'.$totalRow, number_format($totalCost, 0, ',', ' ').' FCFA');

        // Style de la ligne de total
        $sheet->getStyle('A'.$totalRow.':'.$lastColumn.$totalRow)->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E9ECEF'], // Gris clair
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_MEDIUM,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);

        // Ajuster la hauteur des lignes
        $sheet->getRowDimension(1)->setRowHeight(25);
        for ($i = 2; $i <= $lastRow; $i++) {
            $sheet->getRowDimension($i)->setRowHeight(20);
        }
        $sheet->getRowDimension($totalRow)->setRowHeight(25);

        // Ajouter un titre au-dessus du tableau
        $sheet->insertNewRowBefore(1, 2);
        $sheet->mergeCells('A1:'.$lastColumn.'1');
        $sheet->setCellValue('A1', '🛠️ RAPPORT DE MAINTENANCE DES VÉHICULES');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 16,
                'color' => ['rgb' => '0d6efd'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(30);

        // Ajouter la période
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
        $sheet->setCellValue('A2', $period);
        $sheet->getStyle('A2')->applyFromArray([
            'font' => [
                'italic' => true,
                'size' => 11,
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(20);

        return $sheet;
    }

    /**
     * Titre de la feuille Excel
     */
    public function title(): string
    {
        return 'Rapport Maintenance';
    }

    /**
     * Largeur des colonnes
     */
    public function columnWidths(): array
    {
        return [
            'A' => 6,   // N°
            'B' => 12,  // Date
            'C' => 15,  // Véhicule
            'D' => 20,  // Type
            'E' => 15,  // Coût
            'F' => 15,  // Kilométrage
            'G' => 25,  // Fournisseur
            'H' => 12,  // Statut
            'I' => 40,  // Remarques
        ];
    }
}
