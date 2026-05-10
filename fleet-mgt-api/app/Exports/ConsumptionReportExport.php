<?php

namespace App\Exports;

use App\Models\Consumption;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class ConsumptionReportExport implements 
    FromCollection, 
    WithHeadings, 
    WithMapping, 
    WithStyles, 
    WithTitle,
    WithColumnWidths,
    ShouldAutoSize
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
        $this->endDate = $endDate;
        $this->order = $order;
        $this->vehicleId = $vehicleId;
        $this->data = $this->getData();
    }

    /**
     * Récupération des données de consommation
     */
    private function getData()
    {
        $query = Consumption::with(['vehicle'])
            ->whereBetween('date', [$this->startDate, $this->endDate]);

        if ($this->vehicleId) {
            $query->where('vehicle_id', $this->vehicleId);
        }

        return $query->orderBy('date', $this->order)->get();
    }

    /**
     * Collection pour l'export
     */
    public function collection()
    {
        return $this->data;
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
            'Quantité (L)',
            'Prix Unitaire (FCFA)',
            'Montant Total (FCFA)',
            'Kilométrage (Km)',
            'Taux de conso (L/100Km)',
            'Type Carburant',
            'Station'
        ];
    }

    /**
     * Mapping des données pour chaque ligne
     */
    public function map($consumption): array
    {
        // Calcul du taux de consommation si disponible
        $consumptionRate = 0;
        if ($consumption->kilometers && $consumption->kilometers > 0 && $consumption->quantity) {
            $consumptionRate = ($consumption->quantity / $consumption->kilometers) * 100;
        }

        return [
            $this->rowNumber++,
            \Carbon\Carbon::parse($consumption->date)->format('d/m/Y'),
            $consumption->vehicle->license_plate ?? 'N/A',
            number_format($consumption->quantity ?? 0, 2, ',', ' '),
            number_format($consumption->unit_price ?? 0, 0, ',', ' '),
            number_format($consumption->fuel_cost ?? 0, 0, ',', ' '),
            number_format($consumption->kilometers ?? 0, 0, ',', ' '),
            $consumptionRate > 0 ? number_format($consumptionRate, 2, ',', ' ') : 'N/A',
            $this->getFuelTypeLabel($consumption->fuel_type),
            $consumption->station ?? 'N/A'
        ];
    }

    /**
     * Traduction du type de carburant
     */
    private function getFuelTypeLabel($type): string
    {
        $labels = [
            'diesel' => 'Diesel',
            'gasoline' => 'Essence',
            'essence' => 'Essence',
            'super' => 'Super',
            'gas' => 'Gaz',
            'electric' => 'Électrique'
        ];

        return $labels[strtolower($type ?? '')] ?? ucfirst($type ?? 'N/A');
    }

    /**
     * Styles du tableau Excel
     */
    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();
        $lastColumn = $sheet->getHighestColumn();

        // Style de l'en-tête (ligne 1)
        $sheet->getStyle('A1:' . $lastColumn . '1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '198754'] // Vert Bootstrap success
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000']
                ]
            ]
        ]);

        // Style des données (lignes 2 à n)
        if ($lastRow > 1) {
            $sheet->getStyle('A2:' . $lastColumn . $lastRow)->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'CCCCCC']
                    ]
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER
                ]
            ]);

            // Centrer les colonnes spécifiques
            $sheet->getStyle('A2:B' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            // Aligner à droite les colonnes numériques
            $sheet->getStyle('D2:H' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle('I2:J' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Alterner les couleurs des lignes
            for ($i = 2; $i <= $lastRow; $i++) {
                if ($i % 2 == 0) {
                    $sheet->getStyle('A' . $i . ':' . $lastColumn . $i)->applyFromArray([
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => 'F8F9FA']
                        ]
                    ]);
                }
            }
        }

        // Calcul des totaux
        $totalQuantity = $this->data->sum('quantity');
        $totalCost = $this->data->sum('fuel_cost');
        $avgConsumptionRate = $this->calculateAverageConsumptionRate();

        // Ajouter une ligne de total
        $totalRow = $lastRow + 1;
        $sheet->setCellValue('A' . $totalRow, 'TOTAUX');
        $sheet->setCellValue('D' . $totalRow, number_format($totalQuantity, 2, ',', ' ') . ' L');
        $sheet->setCellValue('E' . $totalRow, '-');
        $sheet->setCellValue('F' . $totalRow, number_format($totalCost, 0, ',', ' ') . ' FCFA');
        $sheet->setCellValue('G' . $totalRow, '-');
        $sheet->setCellValue('H' . $totalRow, $avgConsumptionRate > 0 ? number_format($avgConsumptionRate, 2, ',', ' ') . ' (moy.)' : '-');

        // Style de la ligne de total
        $sheet->getStyle('A' . $totalRow . ':' . $lastColumn . $totalRow)->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 11
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'D4EDDA'] // Vert clair
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_MEDIUM,
                    'color' => ['rgb' => '198754']
                ]
            ]
        ]);

        // Ajuster la hauteur des lignes
        $sheet->getRowDimension(1)->setRowHeight(30);
        for ($i = 2; $i <= $lastRow; $i++) {
            $sheet->getRowDimension($i)->setRowHeight(20);
        }
        $sheet->getRowDimension($totalRow)->setRowHeight(25);

        // Ajouter un titre au-dessus du tableau
        $sheet->insertNewRowBefore(1, 2);
        $sheet->mergeCells('A1:' . $lastColumn . '1');
        $sheet->setCellValue('A1', '⛽ RAPPORT DE CONSOMMATION CARBURANT');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 16,
                'color' => ['rgb' => '198754']
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ]);
        $sheet->getRowDimension(1)->setRowHeight(35);

        // Ajouter la période et informations
        $sheet->insertNewRowBefore(2, 1);
        $sheet->mergeCells('A2:' . $lastColumn . '2');
        $period = 'Période : ' . \Carbon\Carbon::parse($this->startDate)->format('d/m/Y') . 
                  ' au ' . \Carbon\Carbon::parse($this->endDate)->format('d/m/Y');
        if ($this->vehicleId) {
            $vehicle = \App\Models\Vehicle::find($this->vehicleId);
            if ($vehicle) {
                $period .= ' | Véhicule : ' . $vehicle->license_plate;
            }
        }
        $period .= ' | Nombre d\'enregistrements : ' . $this->data->count();
        $sheet->setCellValue('A2', $period);
        $sheet->getStyle('A2')->applyFromArray([
            'font' => [
                'italic' => true,
                'size' => 10,
                'color' => ['rgb' => '6C757D']
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER
            ]
        ]);
        $sheet->getRowDimension(2)->setRowHeight(22);

        // Figer les lignes d'en-tête
        $sheet->freezePane('A4');

        return $sheet;
    }

    /**
     * Calcul du taux de consommation moyen
     */
    private function calculateAverageConsumptionRate(): float
    {
        $validRecords = $this->data->filter(function($item) {
            return $item->kilometers > 0 && $item->quantity > 0;
        });

        if ($validRecords->isEmpty()) {
            return 0;
        }

        $totalRate = $validRecords->sum(function($item) {
            return ($item->quantity / $item->kilometers) * 100;
        });

        return $totalRate / $validRecords->count();
    }

    /**
     * Titre de la feuille Excel
     */
    public function title(): string
    {
        return 'Rapport Consommation';
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
            'D' => 14,  // Quantité
            'E' => 18,  // Prix Unitaire
            'F' => 18,  // Montant Total
            'G' => 15,  // Kilométrage
            'H' => 20,  // Taux de conso
            'I' => 14,  // Type Carburant
            'J' => 20,  // Station
        ];
    }
}