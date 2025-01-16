<!-- error.vue
Copyright (C) 2024 GOSQAS
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
    This is the 404 Page page for GOSQAS
-->
<template>
    <NuxtLayout>
        <div class="page-404-padding">
            <div>
                <h1 class="mb-0" style="color: #322253;">404</h1>
                <h2>Page not found</h2>
                <p class="mb-2">We're sorry, the page you're looking for could not be found.</p>
                <div>
                    <RouterLink to="/"><button-component class="button-404" buttonText="Go home" type="submit" padding="14px 95px" style="font-size: 20px; margin-right: 22px;"></button-component></RouterLink>
                    <a href="mailto:gosqasystem@gmail.com"><button-component class="button-404" buttonText="Email us" backgroundColor="#CCECFD"
                        borderColor="#CCECFD" color="#1E2019" padding="14px 95px" style="font-size: 20px;"></button-component></a>
                </div>
            </div>
            <Learn_more id="learn"></Learn_more>
        </div>
    </NuxtLayout>

</template>

<style scoped>
    /* For screens less than 768px*/
    @media (max-width:768px) {
        .page-404-padding {
            padding: 20px 0px 40px 20px;
        }
        .button-404 {
            padding: 12px 50px !important;
        }
    }

    @media (min-width:768px) {
        .page-404-padding {
            padding-top: 150px;
            padding-bottom: 160px;
            display: flex;
            justify-content: center;
        }
    }

    .button-404 {
        margin-top: 20px !important;
    }

</style>