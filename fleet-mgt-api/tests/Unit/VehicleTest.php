<?php

namespace Tests\Unit;

use App\Models\Vehicle;
use PHPUnit\Framework\TestCase;

class VehicleTest extends TestCase
{
    private function makeVehicle(string $status): Vehicle
    {
        $v = new Vehicle;
        $v->status = $status;

        return $v;
    }

    public function test_is_operational_returns_true_when_status_is_operational(): void
    {
        $this->assertTrue($this->makeVehicle('operational')->isOperational());
    }

    public function test_is_operational_returns_false_when_status_is_maintenance(): void
    {
        $this->assertFalse($this->makeVehicle('maintenance')->isOperational());
    }

    public function test_is_operational_returns_false_when_status_is_out_of_service(): void
    {
        $this->assertFalse($this->makeVehicle('out_of_service')->isOperational());
    }
}
