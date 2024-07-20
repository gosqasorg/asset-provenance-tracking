<template>
    <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
    <div class = "body1">
        <h1>Contact</h1><br>
        <div class="container">
  <form id="contact" action="" method="post">

    <fieldset>
      <input placeholder="Full Name" type="text" tabindex="1" required autofocus>
    </fieldset><br>
    <fieldset>
      <input placeholder="Your Email Address" type="email" tabindex="2" required>
    </fieldset><br>
    <fieldset>
      <input placeholder="Your Phone Number" type="tel" tabindex="3" required>
    </fieldset><br>
    <fieldset>
      <p style = "line-height: 30px;" class = "linkstarter">https://<input class = "indentedWebsite" placeholder="Enter Your Website (optional)" type="url" tabindex="4">
        &nbsp&nbsphttp://<input class = "indentedWebsite" placeholder="Enter Your Website (optional)" type="url" tabindex="4"></p>
    </fieldset>
    <fieldset>
      <textarea placeholder="Type Your Message..." tabindex="5" required></textarea>
    </fieldset>
    <fieldset>
      <button name="submit" type="submit" id="contact-submit" data-submit="...Sending">Submit Contact Form</button>
    </fieldset>
  </form>


</div>
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
input {
  width: 100%;
}
textarea {
  width: 100%;

}
input.indentedWebsite {
  width:100%;
}
form {
    text-align:center;
    }
p.linkstarter {
  text-align: left;
  display: flex;
}
button#contact-submit {
    border-width: 0px;
    border-radius: 10px;
    padding: 10px;
    padding-left: 13px;
    padding-right: 13px;
    background-color: #4E3681;
    color: white;
    font-weight: 300;
}
fieldset {
  line-height: 40px;
}
</style>