<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class MonthlyReportExport implements FromView
{
    protected $data;

    public function __construct($reportData)
    {
        $this->data = $reportData;
    }

    public function view(): View
    {
        return view('exports.monthly_report', [
            'vehicle' => $this->data['vehicle'],
            'month' => $this->data['month'],
            'year' => $this->data['year'],
            'logs' => $this->data['logs'],
            'totals' => $this->data['totals'],
        ]);
    }
}
