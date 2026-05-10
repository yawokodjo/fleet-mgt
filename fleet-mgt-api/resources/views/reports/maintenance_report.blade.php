<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport de Maintenance</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 20px;
        }
        .info {
            text-align: center;
            margin-bottom: 30px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background-color: #667eea;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .total {
            background-color: #f0f0f0;
            font-weight: bold;
            border-top: 2px solid #333;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #999;
        }
    </style>
</head>
<body>
    <h1>🛠️ Rapport de Maintenance des Véhicules</h1>
    
    <div class="info">
        <p>
            <strong>Période :</strong> 
            {{ \Carbon\Carbon::parse($start)->format('d/m/Y') }} 
            au 
            {{ \Carbon\Carbon::parse($end)->format('d/m/Y') }}
        </p>
        @if($vehicle_id)
            <p><strong>Véhicule :</strong> {{ $maintenances->first()->vehicle->license_plate ?? 'N/A' }}</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Coût (FCFA)</th>
                <th>Kilométrage (Km)</th>
                <th>Fournisseur</th>
                <th>Remarques</th>
            </tr>
        </thead>
        <tbody>
            @forelse($maintenances as $maintenance)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($maintenance->scheduled_date)->format('d/m/Y') }}</td>
                    <td>{{ $maintenance->maintenance_type }}</td>
                    <td style="text-align: right">{{ number_format($maintenance->cost, 0, ',', ' ') }}</td>
                    <td style="text-align: right">{{ number_format($maintenance->current_mileage ?? 0, 0, ',', ' ') }}</td>
                    <td>{{ $maintenance->vendor ?? 'N/A' }}</td>
                    <td>{{ $maintenance->notes ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center; color: #999;">
                        Aucune maintenance trouvée pour cette période
                    </td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="total">
                <td colspan="2"><strong>TOTAL</strong></td>
                <td style="text-align: right">
                    <strong>{{ number_format($maintenances->sum('cost'), 0, ',', ' ') }} FCFA</strong>
                </td>
                <td colspan="3"></td>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        <p>Rapport généré le {{ \Carbon\Carbon::now()->format('d/m/Y à H:i') }}</p>
    </div>
</body>
</html>