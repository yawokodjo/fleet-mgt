<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport de Maintenance</title>
    <style>
        @page { size: A4 landscape; margin: 10mm 10mm; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 9px; color: #333; }

        .header-block { width: 100%; margin-bottom: 12px; }
        .header-logo  { float: left; width: 15%; }
        .header-logo img { max-height: 55px; max-width: 110px; }
        .header-title { float: left; width: 85%; text-align: center; padding-top: 4px; }
        .report-title { font-size: 15px; font-weight: bold; color: #0d6efd; margin: 0 0 4px 0; }
        .report-period { font-size: 8px; color: #6c757d; font-style: italic; }
        .clearfix { clear: both; }

        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        thead th {
            background-color: #0d6efd;
            color: #fff;
            padding: 7px 4px;
            font-weight: bold;
            font-size: 8.5px;
            border: 1px solid #000;
            text-align: center;
        }
        tbody td { padding: 5px 4px; border: 1px solid #ccc; font-size: 8.5px; }
        tbody tr:nth-child(even) td { background-color: #f8f9fa; }
        .num   { text-align: center; }
        .right { text-align: right; }

        .badge-planned     { color: #0d6efd; font-weight: bold; text-align: center; }
        .badge-in_progress { color: #fd7e14; font-weight: bold; text-align: center; }
        .badge-completed   { color: #198754; font-weight: bold; text-align: center; }
        .badge-cancelled   { color: #dc3545; font-weight: bold; text-align: center; }

        .doc-yes { color: #198754; font-weight: bold; text-align: center; }
        .doc-no  { color: #aaa; text-align: center; }

        tfoot td {
            background-color: #e9ecef;
            font-weight: bold;
            font-size: 8.5px;
            border: 2px solid #000;
            padding: 6px 4px;
        }

        .signatures { margin-top: 28px; width: 100%; }
        .sig-left   { float: left; width: 40%; text-align: center; }
        .sig-right  { float: right; width: 40%; text-align: center; }
        .sig-label  { font-weight: bold; font-size: 10px; margin-bottom: 28px; }
        .sig-line   { border-top: 1px solid #333; margin: 0 10px; font-size: 9px; padding-top: 4px; color: #555; }
        .footer { margin-top: 10px; text-align: center; font-size: 8px; color: #999; clear: both; }
    </style>
</head>
<body>

@php
    /*
     * Colonnes unifiées PDF / Excel — 10 colonnes dans les deux cas
     *
     * — Véhicule unique :
     *     N°(1) | Date prévue(2) | Date réalisée(3) | Type(4) | Société(5) | Kilométrage(6) | Coût(7) | Statut(8) | Description(9) | Document(10)
     *     colspan tfoot = 6 → Coût en col 7
     *
     * — Multi-véhicules :
     *     N°(1) | Date prévue(2) | Date réalisée(3) | Véhicule(4) | Type(5) | Société(6) | Coût(7) | Statut(8) | Description(9) | Document(10)
     *     colspan tfoot = 6 → Coût en col 7  (même alignement !)
     */
    $singleVehicle = (bool) $vehicle_id;
    $totalCost = $maintenances->sum('cost');
    $statusLabels = [
        'planned'     => ['label' => 'Planifié',  'class' => 'badge-planned'],
        'in_progress' => ['label' => 'En cours',  'class' => 'badge-in_progress'],
        'completed'   => ['label' => 'Terminé',   'class' => 'badge-completed'],
        'cancelled'   => ['label' => 'Annulé',    'class' => 'badge-cancelled'],
    ];
@endphp

    {{-- En-tête --}}
    <div class="header-block">
        <div class="header-logo">
            <img src="{{ public_path('logo-ci.png') }}" alt="Logo">
        </div>
        <div class="header-title">
            <div class="report-title">RAPPORT DE MAINTENANCE DES VEHICULES</div>
            <div class="report-period">
                Période : {{ \Carbon\Carbon::parse($start)->format('d/m/Y') }} au {{ \Carbon\Carbon::parse($end)->format('d/m/Y') }}
                @if($singleVehicle && $maintenances->isNotEmpty())
                    &nbsp;|&nbsp; Véhicule : {{ $maintenances->first()->vehicle->license_plate ?? 'N/A' }}
                @endif
                &nbsp;|&nbsp; {{ $maintenances->count() }} enregistrement(s)
            </div>
        </div>
        <div class="clearfix"></div>
    </div>

    {{-- Tableau --}}
    <table>
        <thead>
            <tr>
                <th style="width:3%">N°</th>
                <th style="width:9%">Date prévue</th>
                <th style="width:9%">Date réalisée</th>
                @if(!$singleVehicle)
                    {{-- Col 4 : Véhicule --}}
                    <th style="width:10%">Véhicule</th>
                    <th style="width:13%">Type de maintenance</th>
                    <th style="width:17%">Société / Atelier</th>
                @else
                    {{-- Col 4-6 : Type, Société, Kilométrage --}}
                    <th style="width:14%">Type de maintenance</th>
                    <th style="width:18%">Société / Atelier</th>
                    <th style="width:9%">Kilométrage</th>
                @endif
                <th style="width:10%; text-align:right">Coût (FCFA)</th>
                <th style="width:8%">Statut</th>
                <th style="width:{{ $singleVehicle ? '13' : '14' }}%">Description</th>
                <th style="width:7%">Document</th>
            </tr>
        </thead>
        <tbody>
            @forelse($maintenances as $i => $maintenance)
                @php
                    $si = $statusLabels[$maintenance->status] ?? ['label' => ucfirst($maintenance->status ?? ''), 'class' => ''];
                @endphp
                <tr>
                    <td class="num">{{ $i + 1 }}</td>
                    <td class="num">{{ \Carbon\Carbon::parse($maintenance->scheduled_date)->format('d/m/Y') }}</td>
                    <td class="num">
                        {{ $maintenance->completed_date ? \Carbon\Carbon::parse($maintenance->completed_date)->format('d/m/Y') : 'N/A' }}
                    </td>
                    @if(!$singleVehicle)
                        <td>{{ $maintenance->vehicle->license_plate ?? 'N/A' }}</td>
                        <td>{{ $maintenance->maintenance_type ?? 'N/A' }}</td>
                        <td>{{ $maintenance->maintenance_company ?? 'N/A' }}</td>
                    @else
                        <td>{{ $maintenance->maintenance_type ?? 'N/A' }}</td>
                        <td>{{ $maintenance->maintenance_company ?? 'N/A' }}</td>
                        <td class="right">
                            {{ $maintenance->mileage_at_service
                                ? number_format($maintenance->mileage_at_service, 0, ',', ' ') . ' km'
                                : '—' }}
                        </td>
                    @endif
                    <td class="right">{{ number_format($maintenance->cost ?? 0, 0, ',', ' ') }}</td>
                    <td class="{{ $si['class'] }}">{{ $si['label'] }}</td>
                    <td>{{ $maintenance->description ?? '' }}</td>
                    <td class="{{ $maintenance->document_path ? 'doc-yes' : 'doc-no' }}">
                        {{ $maintenance->document_path ? 'Oui' : '—' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="10" style="text-align:center; color:#999; padding:15px;">
                        Aucune maintenance trouvée pour cette période
                    </td>
                </tr>
            @endforelse
        </tbody>
        @if($maintenances->isNotEmpty())
        <tfoot>
            {{--
                Dans les deux layouts, Coût est en colonne 7 → colspan=6 dans les deux cas.
                Reste 3 colonnes après Coût : Statut, Description, Document.
            --}}
            <tr>
                <td colspan="6" style="text-align:center">TOTAL</td>
                <td style="text-align:right">{{ number_format($totalCost, 0, ',', ' ') }} FCFA</td>
                <td colspan="3"></td>
            </tr>
        </tfoot>
        @endif
    </table>

    {{-- Signatures --}}
    <div class="signatures">
        <div class="sig-left">
            <div class="sig-label">Responsable</div>
            <div class="sig-line">Nom &amp; Signature</div>
        </div>
        <div class="sig-right">
            <div class="sig-label">Superviseur</div>
            <div class="sig-line">Nom &amp; Signature</div>
        </div>
        <div class="clearfix"></div>
    </div>
    <div class="footer">Rapport généré le {{ \Carbon\Carbon::now()->format('d/m/Y à H:i') }}</div>

</body>
</html>
