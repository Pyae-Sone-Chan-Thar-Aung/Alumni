<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('batch_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('batch_group_id');
            $table->foreign('batch_group_id')->references('id')->on('batch_groups');
            $table->uuid('sender_id');
            $table->foreign('sender_id')->references('id')->on('users');
            $table->text('message');
            $table->timestampsTz();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batch_messages');
    }
}; 