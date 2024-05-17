<template>
    <div>
        <form @submit.prevent="submitForm">
            <h2>Notification Sign Up</h2>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" v-model="email" required class="form-control">
            </div>
            
            <div class="form-group">
                <label for="tag">Tag:</label>
                <input type="text" id="tag" v-model="tag" required class="form-control">
            </div>
            
            <button type="submit" class="btn btn-primary">Submit</button>
        </form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            email: '',
            tag: ''
        };
    },
    methods: {
        // Will send tag and email data to database
        submitForm() {
            // // Send the email and tag via API
            // // Replace the API_URL with your actual API endpoint
            // fetch(API_URL, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({
            //         email: this.email,
            //         tag: this.tag
            //     })
            // })
            // .then(response => {
            //     // Handle the API response
            //     // You can show a success message or redirect to another page
            // })
            // .catch(error => {
            //     // Handle any errors that occur during the API request
            // });
        }
    }
};
</script>

<style>
  form {
      background-color: rgb(145, 193, 248);
      border-radius: 10px;
      padding: 30px;
      width: 70%;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
</style>