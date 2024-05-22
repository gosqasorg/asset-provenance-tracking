<!--
    This is the landing page where you can create a new device to track
-->

<template>
    <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
    <div class="navigationBar">
        <a href="http://localhost:3000/"><img class="logohomepage" src="https://www.pubinv.org/wp-content/uploads/image.png"></a>
        <element>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<a href="about"><button
                    class="navigation">About</button></a>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<a href = "https://gosqas.org/devices"><button
                    class="navigation">Sample Devices</button></a>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<a href = "contact"><button
                    class="navigation" style="margin-right: 100px;">Contact</button></a></element>
    </div>
    <div class="mainStuff">
        <div>
            <h1 style="line-height: 100px; font-weight: 900; color: #4E3681;">GOSQAS Asset History Tracker</h1>
            <p>
                The Global Open Source Quality Assurance System (GOSQAS) provides the opportunity to create truthful,
                transparent documentation via our open source provenance tracker, Global Distributed Tracking (GDT).
                Designed specifically for low-resource settings, GDT allows anyone with simple website access to
                securely record their project data. Our development philosophy of “Trust Through Transparency” (TTT)
                encourages better global communication within diverse communities- to include humanitarian response,
                open source hardware, and scientific research.
            </p><br>
            <!-- <container><button style="border-radius: 10px; padding: 3px; background-color: transparent; border-color: #4e3681;"><button class = "switchChoice">Create Device</button>&nbsp&nbsp<button class = "switchChoice">Create Container</button></button></container><br><br> -->
        </div>
        <div>Create a Single Asset:</div>
        <CreateDevice /><br>
        <div style="float: center;">Or, if you want to create a group of keys:</div>
        <div></div>
        <CreateContainer />
    </div>
</template>
<style>

    body {
        font-family: 'Poppins', sans-serif;
    }
    .navigationBar {
        display: flex;
        align-items: center;
        padding-top: 7px;
        background-color: #e6f6ff;
    }
    .logohomepage {
        width: 60px;
        margin: 20px 20px 20px 50px;
    }
    element {
        margin-left: auto;
        display: flex;
        align-items: center;
    }
    button.navigation {
        background-color: transparent;
        border-width: 0;
        text-align: center;
        margin: 0 10px;
    }
    .mainStuff {
        margin: 50px;
        margin-top: 30px;
    }
</style>