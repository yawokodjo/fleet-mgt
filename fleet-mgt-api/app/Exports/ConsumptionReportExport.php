<?php

namespace App\Exports;

use App\Models\Consumption;
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

class ConsumptionReportExport implements FromCollection, ShouldAutoSize, WithColumnWidths, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $startDate;

    protected $endDate;

    protected $order;

    protected $vehicleId;

    protected $rowNumber = 1;

    protected $data;

    protected $mileageData = [];

    public function __construct($startDate, $endDate, $order = 'asc', $vehicleId = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->order = $order;
        $this->vehicleId = $vehicleId;
        $this->data = $this->getData();

        if ($this->vehicleId) {
            $this->mileageData = $this->computeMileageData($this->data);
        }
    }

    private function getData()
    {
        $query = Consumption::with(['vehicle', 'driver'])
            ->whereBetween('date', [$this->startDate, $this->endDate]);

        if ($this->vehicleId) {
            $query->where('vehicle_id', $this->vehicleId);
        }

        return $query->orderBy('date', $this->order)->get();
    }

    private function computeMileageData($data): array
    {
        $sorted = $data->sortBy('date')->values();
        $result = [];
        foreach ($sorted as $i => $c) {
            if ($i === 0 || ! $c->mileage) {
                $result[$c->id] = ['distance' => null, 'taux' => null];
            } else {
                $prev = $sorted[$i - 1];
                $dist = ($prev->mileage && $c->mileage > $prev->mileage)
                    ? ($c->mileage - $prev->mileage)
                    : null;
                $taux = ($dist && $dist > 0 && $c->fuel_volume > 0)
                    ? round($c->fuel_volume / $dist * 100, 2)
                    : null;
                $result[$c->id] = ['distance' => $dist, 'taux' => $taux];
            }
        }

        return $result;
    }

    public function collection()
    {
        return $this->data;
    }

    public function headings(): array
    {
        /*
         * Ordre unifié avec le PDF
         * Véhicule unique  : N° | Date | Conducteur | Kilométrage | Volume (L) | Distance | Taux | Coût Total | Coût/Litre | Document
         * Multi-véhicules  : N° | Date | Véhicule | Conducteur | Volume (L) | Coût Total | Coût/Litre | Document
         */
        if ($this->vehicleId) {
            return [
                'N°', 'Date', 'Conducteur',
                'Kilométrage (km)', 'Volume (L)', 'Distance (km)', 'Taux (L/100km)',
                'Coût Total (FCFA)', 'Coût / Litre (FCFA)', 'Document',
            ];
        }

        return ['N°', 'Date', 'Véhicule', 'Conducteur', 'Volume (L)', 'Coût Total (FCFA)', 'Coût / Litre (FCFA)', 'Document'];
    }

    public function map($consumption): array
    {
        $costPerLiter = $consumption->fuel_volume > 0
            ? round($consumption->fuel_cost / $consumption->fuel_volume, 0)
            : 0;

        $md = $this->mileageData[$consumption->id] ?? ['distance' => null, 'taux' => null];

        if (! $this->vehicleId) {
            // Multi-véhicules : N° | Date | Véhicule | Conducteur | Volume | Coût | Coût/L | Document
            return [
                $this->rowNumber++,
                \Carbon\Carbon::parse($consumption->date)->format('d/m/Y'),
                $consumption->vehicle->license_plate ?? 'N/A',
                $consumption->driver->name ?? 'N/A',
                number_format($consumption->fuel_volume ?? 0, 2, ',', ' '),
                number_format($consumption->fuel_cost ?? 0, 0, ',', ' '),
                $costPerLiter > 0 ? number_format($costPerLiter, 0, ',', ' ') : '—',
                $consumption->document_path ? 'Oui' : '—',
            ];
        }

        // Véhicule unique : N° | Date | Conducteur | Kilométrage | Volume | Distance | Taux | Coût | Coût/L | Document
        return [
            $this->rowNumber++,
            \Carbon\Carbon::parse($consumption->date)->format('d/m/Y'),
            $consumption->driver->name ?? 'N/A',
            $consumption->mileage ? number_format($consumption->mileage, 0, ',', ' ') : '—',
            number_format($consumption->fuel_volume ?? 0, 2, ',', ' '),
            $md['distance'] ? number_format($md['distance'], 0, ',', ' ') : '—',
            $md['taux'] ? number_format($md['taux'], 1, ',', ' ') : '—',
            number_format($consumption->fuel_cost ?? 0, 0, ',', ' '),
            $costPerLiter > 0 ? number_format($costPerLiter, 0, ',', ' ') : '—',
            $consumption->document_path ? 'Oui' : '—',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();
        $lastColumn = $sheet->getHighestColumn();

        // En-tête
        $sheet->getStyle('A1:'.$lastColumn.'1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '198754']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]],
        ]);

        // Données
        if ($lastRow > 1) {
            $sheet->getStyle('A2:'.$lastColumn.$lastRow)->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'CCCCCC']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            for ($i = 2; $i <= $lastRow; $i++) {
                if ($i % 2 === 0) {
                    $sheet->getStyle('A'.$i.':'.$lastColumn.$i)->applyFromArray([
                        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F8F9FA']],
                    ]);
                }
            }
        }

        // Ligne de totaux
        $totalRow = $lastRow + 1;
        $totalVol = $this->data->sum('fuel_volume');
        $totalCost = $this->data->sum('fuel_cost');
        $totalDist = $this->vehicleId
            ? array_sum(array_column(array_filter($this->mileageData, fn ($d) => $d['distance']), 'distance'))
            : 0;
        $avgTaux = ($this->vehicleId && $totalDist > 0)
            ? round($totalVol / $totalDist * 100, 2)
            : null;

        /*
         * Véhicule unique  (10 cols) : A=N° B=Date C=Conducteur D=Km E=Volume F=Distance G=Taux H=Coût I=CpL J=Doc
         * Multi-véhicules  (8 cols)  : A=N° B=Date C=Véhicule D=Conducteur E=Volume F=Coût G=CpL H=Doc
         */
        $sheet->setCellValue('A'.$totalRow, 'TOTAUX');
        if ($this->vehicleId) {
            $sheet->setCellValue('E'.$totalRow, number_format($totalVol, 2, ',', ' ').' L');
            $sheet->setCellValue('F'.$totalRow, $totalDist ? number_format($totalDist, 0, ',', ' ').' km' : '—');
            $sheet->setCellValue('G'.$totalRow, $avgTaux ? number_format($avgTaux, 1, ',', ' ').' L/100km' : '—');
            $sheet->setCellValue('H'.$totalRow, number_format($totalCost, 0, ',', ' ').' FCFA');
        } else {
            $sheet->setCellValue('E'.$totalRow, number_format($totalVol, 2, ',', ' ').' L');
            $sheet->setCellValue('F'.$totalRow, number_format($totalCost, 0, ',', ' ').' FCFA');
        }

        $sheet->getStyle('A'.$totalRow.':'.$lastColumn.$totalRow)->applyFromArray([
            'font' => ['bold' => true, 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D4EDDA']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '198754']]],
        ]);

        // Hauteurs
        $sheet->getRowDimension(1)->setRowHeight(30);
        for ($i = 2; $i <= $lastRow; $i++) {
            $sheet->getRowDimension($i)->setRowHeight(20);
        }
        $sheet->getRowDimension($totalRow)->setRowHeight(25);

        // Titre
        $sheet->insertNewRowBefore(1, 2);
        $sheet->mergeCells('A1:'.$lastColumn.'1');
        $sheet->setCellValue('A1', 'RAPPORT DE CONSOMMATION CARBURANT');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => '198754']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(35);

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
            'font' => ['italic' => true, 'size' => 10, 'color' => ['rgb' => '6C757D']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(22);

        $sheet->freezePane('A4');

        return $sheet;
    }

    public function title(): string
    {
        return 'Rapport Consommation';
    }

    public function columnWidths(): array
    {
        if ($this->vehicleId) {
            return ['A' => 5, 'B' => 12, 'C' => 22, 'D' => 12, 'E' => 14, 'F' => 14, 'G' => 14, 'H' => 18, 'I' => 18, 'J' => 10];
        }

        return ['A' => 5, 'B' => 12, 'C' => 15, 'D' => 22, 'E' => 12, 'F' => 18, 'G' => 18, 'H' => 10];
    }
}
