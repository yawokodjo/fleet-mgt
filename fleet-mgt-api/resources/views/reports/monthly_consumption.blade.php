<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport de Consommation Carburant</title>
    <style>
        @page { size: A4 landscape; margin: 10mm 10mm; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 10px; color: #333; }

        .header-block { width: 100%; margin-bottom: 12px; }
        .header-logo  { float: left; width: 15%; }
        .header-logo img { max-height: 55px; max-width: 110px; }
        .header-title { float: left; width: 85%; text-align: center; padding-top: 4px; }
        .report-title { font-size: 16px; font-weight: bold; color: #198754; margin: 0 0 4px 0; }
        .report-period { font-size: 9px; color: #6c757d; font-style: italic; }
        .clearfix { clear: both; }

        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        thead th {
            background-color: #198754;
            color: #fff;
            padding: 7px 5px;
            font-weight: bold;
            font-size: 9px;
            border: 1px solid #000;
            text-align: center;
        }
        tbody td { padding: 5px; border: 1px solid #ccc; font-size: 9px; }
        tbody tr:nth-child(even) td { background-color: #f8f9fa; }
        .num   { text-align: center; }
        .right { text-align: right; }

        .doc-yes { color: #198754; font-weight: bold; text-align: center; }
        .doc-no  { color: #aaa; text-align: center; }

        tfoot td {
            background-color: #d4edda;
            font-weight: bold;
            font-size: 9px;
            border: 2px solid #198754;
            padding: 6px 5px;
        }

        .note { margin-top: 6px; font-size: 8px; color: #888; font-style: italic; }

        .signatures { margin-top: 30px; width: 100%; }
        .sig-left   { float: left; width: 40%; text-align: center; }
        .sig-right  { float: right; width: 40%; text-align: center; }
        .sig-label  { font-weight: bold; font-size: 10px; margin-bottom: 30px; }
        .sig-line   { border-top: 1px solid #333; margin: 0 10px; font-size: 9px; padding-top: 4px; color: #555; }
        .footer { margin-top: 12px; text-align: center; font-size: 8px; color: #999; clear: both; }
    </style>
</head>
<body>

@php
    /*
     * Colonnes unifiées PDF / Excel
     * — Véhicule unique :
     *     N° | Date | Conducteur | Kilométrage | Volume (L) | Distance (km) | Taux (L/100km) | Coût Total | Coût/Litre | Document
     *     colspan tfoot = 3  (N°, Date, Conducteur)
     *
     * — Multi-véhicules :
     *     N° | Date | Véhicule | Conducteur | Volume (L) | Coût Total | Coût/Litre | Document
     *     colspan tfoot = 4  (N°, Date, Véhicule, Conducteur)
     */
    $singleVehicle = (bool) $vehicle_id;

    // Calcul distances / taux (tri ASC par date)
    $mileageData = [];
    if ($singleVehicle) {
        $sorted = $consumptions->sortBy('date')->values();
        foreach ($sorted as $i => $c) {
            if ($i === 0 || !$c->mileage) {
                $mileageData[$c->id] = ['distance' => null, 'taux' => null];
            } else {
                $prev = $sorted[$i - 1];
                $dist = ($prev->mileage && $c->mileage > $prev->mileage)
                    ? ($c->mileage - $prev->mileage) : null;
                $taux = ($dist && $dist > 0 && $c->fuel_volume > 0)
                    ? round($c->fuel_volume / $dist * 100, 2) : null;
                $mileageData[$c->id] = ['distance' => $dist, 'taux' => $taux];
            }
        }
    }

    $totalVolume = $consumptions->sum('fuel_volume');
    $totalCost   = $consumptions->sum('fuel_cost');
    $validDists  = array_filter($mileageData, fn($d) => $d['distance'] !== null);
    $totalDist   = $singleVehicle ? array_sum(array_column($validDists, 'distance')) : 0;
    $avgTaux     = ($singleVehicle && $totalDist > 0) ? round($totalVolume / $totalDist * 100, 2) : null;
@endphp

    {{-- En-tête --}}
    <div class="header-block">
        <div class="header-logo">
            <img src="{{ public_path('logo-ci.png') }}" alt="Logo">
        </div>
        <div class="header-title">
            <div class="report-title">RAPPORT DE CONSOMMATION CARBURANT</div>
            <div class="report-period">
                Période : {{ \Carbon\Carbon::parse($start)->format('d/m/Y') }} au {{ \Carbon\Carbon::parse($end)->format('d/m/Y') }}
                @if($singleVehicle && $consumptions->isNotEmpty())
                    &nbsp;|&nbsp; Véhicule : {{ $consumptions->first()->vehicle->license_plate ?? 'N/A' }}
                @endif
                &nbsp;|&nbsp; {{ $consumptions->count() }} enregistrement(s)
            </div>
        </div>
        <div class="clearfix"></div>
    </div>

    {{-- Tableau --}}
    <table>
        <thead>
            <tr>
                {{-- Colonnes communes --}}
                <th style="width:3%">N°</th>
                <th style="width:9%">Date</th>
                @if(!$singleVehicle)
                    <th style="width:11%">Véhicule</th>
                @endif
                <th style="width:{{ $singleVehicle ? '14' : '15' }}%">Conducteur</th>

                {{-- Colonnes kilométriques (véhicule unique uniquement) --}}
                @if($singleVehicle)
                    <th style="width:10%">Kilométrage (km)</th>
                @endif

                <th style="width:{{ $singleVehicle ? '9' : '12' }}%; text-align:right">Volume (L)</th>

                @if($singleVehicle)
                    <th style="width:9%">Distance (km)</th>
                    <th style="width:10%">Taux (L/100km)</th>
                @endif

                <th style="width:{{ $singleVehicle ? '12' : '14' }}%; text-align:right">Coût Total (FCFA)</th>
                <th style="width:{{ $singleVehicle ? '11' : '13' }}%; text-align:right">Coût / Litre</th>
                <th style="width:7%">Document</th>
            </tr>
        </thead>
        <tbody>
            @forelse($consumptions as $i => $consumption)
                @php
                    $cpl = $consumption->fuel_volume > 0
                        ? round($consumption->fuel_cost / $consumption->fuel_volume, 0)
                        : null;
                    $md = $mileageData[$consumption->id] ?? ['distance' => null, 'taux' => null];
                @endphp
                <tr>
                    <td class="num">{{ $i + 1 }}</td>
                    <td class="num">{{ \Carbon\Carbon::parse($consumption->date)->format('d/m/Y') }}</td>
                    @if(!$singleVehicle)
                        <td>{{ $consumption->vehicle->license_plate ?? 'N/A' }}</td>
                    @endif
                    <td>{{ $consumption->driver->name ?? 'N/A' }}</td>

                    @if($singleVehicle)
                        <td class="right">{{ $consumption->mileage ? number_format($consumption->mileage, 0, ',', ' ') : '—' }}</td>
                    @endif

                    <td class="right">{{ number_format($consumption->fuel_volume ?? 0, 2, ',', ' ') }}</td>

                    @if($singleVehicle)
                        <td class="right">{{ $md['distance'] ? number_format($md['distance'], 0, ',', ' ') : '—' }}</td>
                        <td class="right">{{ $md['taux'] ? number_format($md['taux'], 1, ',', ' ') : '—' }}</td>
                    @endif

                    <td class="right">{{ number_format($consumption->fuel_cost ?? 0, 0, ',', ' ') }}</td>
                    <td class="right">{{ $cpl ? number_format($cpl, 0, ',', ' ') : '—' }}</td>
                    <td class="{{ $consumption->document_path ? 'doc-yes' : 'doc-no' }}">
                        {{ $consumption->document_path ? 'Oui' : '—' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="{{ $singleVehicle ? 10 : 8 }}" style="text-align:center; color:#999; padding:15px;">
                        Aucune consommation trouvée pour cette période
                    </td>
                </tr>
            @endforelse
        </tbody>
        @if($consumptions->isNotEmpty())
        <tfoot>
            @if($singleVehicle)
            {{--
                Colonnes : N°(1) Date(2) Conducteur(3) | Km(4) | Vol(5) | Dist(6) | Taux(7) | Coût(8) | CpL(9) | Doc(10)
                colspan=3 couvre N°, Date, Conducteur → volume tombe exactement sur col 5
            --}}
            <tr>
                <td colspan="3" style="text-align:center">TOTAUX</td>
                <td style="text-align:center">—</td>
                <td style="text-align:right">{{ number_format($totalVolume, 2, ',', ' ') }} L</td>
                <td style="text-align:right">{{ $totalDist ? number_format($totalDist, 0, ',', ' ') . ' km' : '—' }}</td>
                <td style="text-align:right">{{ $avgTaux ? number_format($avgTaux, 1, ',', ' ') . ' L/100km' : '—' }}</td>
                <td style="text-align:right">{{ number_format($totalCost, 0, ',', ' ') }} FCFA</td>
                <td style="text-align:center">—</td>
                <td style="text-align:center">—</td>
            </tr>
            @else
            {{--
                Colonnes : N°(1) Date(2) Véhicule(3) Conducteur(4) | Vol(5) | Coût(6) | CpL(7) | Doc(8)
                colspan=4 couvre N°, Date, Véhicule, Conducteur
            --}}
            <tr>
                <td colspan="4" style="text-align:center">TOTAUX</td>
                <td style="text-align:right">{{ number_format($totalVolume, 2, ',', ' ') }} L</td>
                <td style="text-align:right">{{ number_format($totalCost, 0, ',', ' ') }} FCFA</td>
                <td style="text-align:center">—</td>
                <td style="text-align:center">—</td>
            </tr>
            @endif
        </tfoot>
        @endif
    </table>

    @if($singleVehicle)
    <div class="note">
        * Kilométrage = relevé compteur au plein &nbsp;|&nbsp;
        Distance = km[i] − km[i−1] entre deux pleins consécutifs &nbsp;|&nbsp;
        Taux = Volume ÷ Distance × 100 &nbsp;|&nbsp;
        « — » = premier plein de la période ou kilométrage non saisi
    </div>
    @endif

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
