<template>
    <div class="page-invalid-key-padding">
        <div class="content-box">
            <h1 class="mb-0 error-heading">Invalid history key</h1>
            <h2 class="error-body">No record attached to this key</h2>
            <p class="mb-2 error-body">
                We’re sorry, the record you’re looking for could not be found. Please double-check your key. If you keep receiving this error, email us at <a class="error-email" href="mailto:info@gosqas.org">info@gosqas.org</a>.
            </p>
            <div>
                <RouterLink to="/"><button-component class="button-invalid-key home-btn" buttonText="Go home" type="submit" padding="14px 95px" style="font-size: 20px; margin-right: 22px;"></button-component></RouterLink>
                <RouterLink to="/contact"><button-component class="button-invalid-key email-btn" buttonText="Email us" backgroundColor="#CCECFD"
                    borderColor="#CCECFD" color="#1E2019" padding="14px 95px" style="font-size: 20px;"></button-component></RouterLink>
            </div>
        </div>
        <Learn_more id="learn"></Learn_more>
    </div>

</template>

<style scoped>
    .button-invalid-key {
        margin-top: 20px !important;
    }
    
    .error-heading {
        color: #322253;
    }

    /* For screens less than 768px*/
    @media (max-width:768px) {
        .page-invalid-key-padding {
            padding: 20px 0px 40px 20px;
        }
        .button-invalid-key {
            padding: 12px 50px !important;
        }
    }

    @media (min-width:768px) {
        .page-invalid-key-padding {
            padding-top: 150px;
            padding-bottom: 160px;
            display: flex;
            justify-content: center;
        }
        .content-box {
            max-width: 700px;
            width: 100%;
            text-align: left;
        }
    }

    .home-btn:hover {
        background-color: #322253 !important;
        border-color: #322253 !important;
    }
    .email-btn:hover {
        background-color: #e6f6ff !important;
        border-color: #e6f6ff !important;
    }

    @media (prefers-color-scheme: dark) {
        .error-heading {
            color: #ccecfd;
        }
        .error-body {
            color: white;
        }
    }
</style>