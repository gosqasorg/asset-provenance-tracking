<template>
    <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
    <div class = "body1">
        <h1>About Us</h1>
The Global Open Source Quality Assurance System (GOSQAS) creates
opportunities for better practices across the diverse humanitarian
response, open-source hardware, and scientific research
communities. We employ open-source tools and principles to centralize
user solutions, despite location or resource environment.

<h4>Our current products</h4>

    As an open-source organization, GOSQAS prioritizes transparency in all
projects. Because we know that openness and clarity build trust and
promote wide user adoption, our commitment to Trust Through
Transparency (TTT) ensures our initiatives are enacted with integrity
and accountability.


<h2>Our Values</h2>

<h5>Data Ownership</h5>
Users maintain full ownership of the data generated within the GOSQAS flagship product, Global Distributed Tracking. We do not have access to any user data, ensuring complete privacy and independent ownership.


<h5>Simplicity & Accessibility</h5>
All users, especially laypersons in limited resource environments, have access to GOSQAS projects. We believe that open-source projects should be simple to use and understand.

<h5>Open Source</h5>
Our projects are created for the public good and are available either free of charge or at minimal cost, reinforcing our dedication to community benefit and accessibility.
<h4>Interested in learning more?</h4>
Learn more about Global Distributed Tracking by emailing us at gosqasystem@gmail.com or visiting the links below.

 <div>

    <button-component class="mt-3 mb-5 textToLinkButton0" buttonText="How It Works" color="#4e3681" backgroundColor="white"/>
    <button-component class="mt-3 mb-5 textToLinkButton0" buttonText="Data & Privacy" margin="0px 0px 0px 20px" color="#4e3681" backgroundColor="white"/>
    <button-component class="mt-3 mb-5 textToLinkButton0" buttonText="GDT GitHub" margin="0px 0px 0px 20px" color="#4e3681" backgroundColor="white"/>

    </div>
    </div>
</template>

<script lang="ts">
import ButtonComponent from '~/components/ButtonComponent.vue';
</script>

<style>
body {
    font-family: 'Poppins', sans-serif;
}
div.body1 {
    margin: 50px;
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
h1 {
    font-weight: 900;
    text-align: center;
    margin-top: 70px;
    color: #4E3681;
}
h2 {
    color:#4E3681;
    line-height: 80px;
    font-weight: 900;
}
.mainStuff {
    margin: 50px;
    margin-top: 30px;
}
.buttonSpacing {
    display: flex;
    column-gap: 20px;
}
</style>