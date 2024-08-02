<!-- how_it_works.vue
Copyright (C) 2024 GOSQAS Team
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. -->
<!--
    This is the How it Works page for GOSQAS
-->

<template>
    <div class="container-fluid" style="padding: 80px 200px 100px 200px;"> 
        <div class="row" >
            <h1 class="text-iris" style="margin-bottom:32px;">How It Works</h1>
            <p>Designed by Global Open Source Quality Assurance System (GOSQAS), 
                Global Distributed Tracking (GDT) is a software platform enabling closed-loop tracking for products, 
                information, and logistics.<br><br>

                Our development process is led by the mission of “Trust Through Transparency”. We've optimized Global 
                Distributed Tracking to function in low-resource environments where internet and electricity access is limited.</p>

            <ul class="text-iris" style="font-size: 20px; font-weight: 600;">Global Distributed Tracking targets solutions in:</ul>
            <div class="col-6 mx-3">
                <li>Last mile verification</li>
                <li>Fraud and theft prevention</li>
            </div>            
            <div class="col">
                <li>Quality Assurance</li>
                <li>Donor/NGO Communication</li>
            </div>

            <ul class="text-iris" style="font-size: 20px; font-weight: 600;">Features include:</ul>
            <div class="col-6 mx-3">
                <li>Completely free service with no hidden fees</li>
                <li>Fully encrypted data</li>
                <li>Open source transparency</li>
            </div>            
            <div class="col">
                <li>No downloads</li>
                <li>No-hassle security</li>
                <li>Tamper-proof, append-only records</li>
            </div>

        </div>

        <div class="row">
            <h2 class="text-iris">Overview</h2>
            <div class="col text-center">
                <img src="../assets/images/cross-icon.png" style="height:50px">
                <p>1. Manufacturer creates a GDT identifier to share with testing agency</p>
            </div>
            <div class="col text-center">
                <img src="../assets/images/upload-icon.png" style="height:44.86px">
                <p>2. Testing agency uploads documentation</p>
            </div>
            <div class="col text-center">
                <img src="../assets/images/check-icon.png" style="height:50px">
                <p>3. Distributor views information within GDT and verifies product</p>
            </div>
            <div class="col text-center">
                <img src="../assets/images/gosqas-icon.png" style="height:50px">
                <p>4. Medical staff received verified product and records shipment receipt in GDT</p>
            </div>

        </div>



    </div>

</template>

<style>

li{
    font-weight: 400;
}

</style>