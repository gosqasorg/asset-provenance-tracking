<template>
    <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
    <div class="navigationBar">
        <a href="http://localhost:3000/"><img class="logohomepage" src="https://www.pubinv.org/wp-content/uploads/image.png"></a>
        <element>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<a href="about"><button
                    class="navigation">About</button></a>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<a href = "https://gosqas.org/devices"><button
                    class="navigation">Sample Devices</button></a>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<a href = "contact"><button
                    class="navigation" style="margin-right: 100px;">Contact</button></a></element>
    </div>
    
    <div class = "body1">
        <h1>About</h1>
        <h2>Motivaton</h2>
        <p>The Global Open Source Quality Assurance System (GOSQAS) provides the opportunity to create truthful, transparent documentation via our open source provenance tracker, Global Distributed Tracking (GDT). Designed specifically for low-resource settings, GDT allows anyone with simple website access to securely record their project data. Our development philosophy of “Trust Through Transparency” (TTT) encourages better global communication within diverse communities. Originally designed to promote trust in open source medical devices, GDT has grown to serve an ever-increasing user base to include humanitarian aid networks, biomedical engineering, scientific research, and distributed manufacturing.</p>
        <h2>Concept</h2>
        <p>The Global Distributed Tracking project allows anyone with project data to trace the provenance (or history) of that data and add to it using a simple website. This centralized documentation capability allows us to revolutionize the tracking of global humanitarian aid in the “last mile” using modern computer science and cryptography, without the use of web3 or blockchain. Key project assets include a QR code and Unique Device Identifiers. The core language is Javascript/node.js/typescript, using Nuxt, Vue, and Azure blob storage.</p>
<p>We are actively recruiting volunteer programmers and computer scientists, with a time expectation of 6 hours per week for 6 months. Volunteers will be part of a professional computer science team using modern Agile techniques, be exposed to modern cryptographic tools, and have an opportunity to help design novel zero-knowledge notification systems and in browser cryptography.</p>
<p>Ideal volunteers are motivated to design a novel system with enormous potential global impact in the philanthropic, fraud prevention, and supply chains of low- and middle-income countries.</p>
    </div>
</template>
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
</style>