<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport de Consommation</title>
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
            background-color: #198754;
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
    <h1>⛽ Rapport de Consommation Carburant</h1>
    
    <div class="info">
        <p>
            <strong>Période :</strong> 
            {{ \Carbon\Carbon::parse($start)->format('d/m/Y') }} 
            au 
            {{ \Carbon\Carbon::parse($end)->format('d/m/Y') }}
        </p>
        @if($vehicle_id)
            <p><strong>Véhicule :</strong> {{ $consumptions->first()->vehicle->license_plate ?? 'N/A' }}</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Quantité (L)</th>
                <th>Prix Unitaire (FCFA)</th>
                <th>Montant Total (FCFA)</th>
                <th>Kilométrage (Km)</th>
                <th>Taux conso (L/100Km)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($consumptions as $consumption)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($consumption->date)->format('d/m/Y') }}</td>
                    <td style="text-align: right">{{ number_format($consumption->quantity, 2, ',', ' ') }}</td>
                    <td style="text-align: right">{{ number_format($consumption->unit_price, 0, ',', ' ') }}</td>
                    <td style="text-align: right">{{ number_format($consumption->fuel_cost, 0, ',', ' ') }}</td>
                    <td style="text-align: right">{{ number_format($consumption->kilometers ?? 0, 0, ',', ' ') }}</td>
                    <td style="text-align: right">
                        @if($consumption->kilometers > 0)
                            {{ number_format(($consumption->quantity / $consumption->kilometers) * 100, 2, ',', ' ') }}
                        @else
                            -
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center; color: #999;">
                        Aucune consommation trouvée pour cette période
                    </td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="total">
                <td><strong>TOTAL</strong></td>
                <td style="text-align: right">
                    <strong>{{ number_format($consumptions->sum('quantity'), 2, ',', ' ') }} L</strong>
                </td>
                <td></td>
                <td style="text-align: right">
                    <strong>{{ number_format($consumptions->sum('fuel_cost'), 0, ',', ' ') }} FCFA</strong>
                </td>
                <td colspan="2"></td>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        <p>Rapport généré le {{ \Carbon\Carbon::now()->format('d/m/Y à H:i') }}</p>
    </div>
</body>
</html>