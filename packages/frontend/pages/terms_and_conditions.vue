<!-- terms_and_conditions.vue
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
    This is the Terms and Conditions page for GOSQAS
-->

<script setup lang="ts">
    const route = useRoute()
</script>

<template>
    <div class="container-fluid" id="terms-and-conditions-container">
        <h1 class="h1-text">Terms and Conditions</h1>
        <p class="p-text" style="margin-bottom:32px;">Last Updated September 23, 2024</p>
        <div class="row">
            <h3 class="h3-text" id="subtitle">Agreement to Our Legal Terms</h3>
            <p class="p-text" style="margin-bottom:32px;">
                We are the Global Open Source Quality Assurance System “GOSQAS.” We operate the website 
                <a class="a-text" href="https://gosqas.org">https://gosqas.org</a>. You can contact us by email at 
                <span style="font-weight: 400;" class="text-decoration-underline"> 
                gosqasystem@gmail.com</span>.<br><br>

                These Legal Terms constitute a legally binding agreement made between you, whether 
                personally or on behalf of an entity ("you"), and Global Open Source Quality Assurance 
                System concerning your access to and use of the Services. You agree that by accessing the 
                Services, you have read, understood, and agreed to be bound by all of these Legal Terms.<br><br>

                <strong>If you do not agree with all of these legal terms, then you are expressly prohibited from 
                using the services and you must discontinue use immediately.</strong><br><br>

                Supplemental terms and conditions or documents that may be posted on the Services from 
                time to time are hereby expressly incorporated herein by reference. We reserve the right, 
                in our sole discretion, to make changes or modifications to these Legal Terms from time to 
                time. We will alert you about any changes by updating the "Last updated" date of these 
                Legal Terms, and you waive any right to receive specific notice of each such change. 
                It is your responsibility to periodically review these Legal Terms to stay informed of 
                updates. You will be subject to, and will be deemed to have been made aware of and to have 
                accepted, the changes in any revised Legal Terms by your continued use of the Services 
                after the date such revised Legal Terms are posted.<br><br>

                The information provided when using the Services is not intended for distribution or use 
                by any person or entity in any jurisdiction or country where such distribution or use would 
                be contrary to law or regulation or which would subject us to any registration requirement 
                within such jurisdiction or country. Accordingly, those persons who choose to access the 
                Services from other locations do so on their own initiative and are solely responsible for 
                compliance with local laws if and to the extent local laws are applicable.<br><br>

                The Services are not tailored to comply with industry-specific regulations (Health 
                Insurance Portability and Accountability Act (HIPAA), Federal Information Security 
                Management Act (FISMA), etc.), so if your interactions would be subjected to such laws, 
                you may not use the Services. You may not use the Services in a way that would violate 
                the Gramm-Leach-Bliley Act (GLBA).
            </p>
            <h3 class="h3-text" id="subtitle">Prohibited Activities</h3>
            <p class="p-text" style="margin-bottom:32px;">
                You will not post, send, publish, upload, or transmit through the Services any Submission 
                nor post any Contribution that is illegal, harassing, hateful, harmful, defamatory, obscene, 
                bullying, abusive, discriminatory, threatening to any person or group, sexually explicit, 
                false, inaccurate, deceitful, or misleading; to the extent permissible by applicable law.<br><br>

                You will not post, send, publish, upload or transmit through the Services any Submission nor 
                post an Contribution whose intent is to reveal information, whether public or not, that is 
                intended to cause harassment or harm to an individual or group, or that would generally be 
                considered “doxxing”.
            </p>
            <h3 class="h3-text" id="subtitle">Limitations of Liability</h3>
            <p class="p-text" style="margin-bottom:32px;">
                <strong>In no event will we or our directors, employees, or agents be liable to you or any 
                third party for any direct, indirect, consequential, exemplary, incidental, special, or 
                punitive damages, including lost profit, lost revenue, loss of data, or other damages 
                arising from your use of the services, even if we have been advised of the possibility 
                of such damages.</strong>
            </p>
            <h3 class="h3-text" id="subtitle">Indemnification</h3>
            <p class="p-text" style="margin-bottom:32px;">
                You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, 
                and all of our respective officers, agents, partners, and employees, from and against any 
                loss, damage, liability, claim, or demand, including reasonable attorney's fees and expenses, 
                made by any third party due to or arising out of:<br><br>

                1. your Contributions;<br>
                2. use of the Services;<br>
                3. breach of these Legal Terms;<br>
                4. any breach of your representations and warranties set forth in these Legal Terms;<br>
                5. your violation of the rights of a third party, including but not limited to intellectual property rights;<br>
                6. any overt harmful act toward any other user of the Services with whom you connected via the Services.
            </p>
            <h3 class="h3-text" id="subtitle">User Data</h3>
            <p class="p-text" style="margin-bottom:32px;">
                We maintain certain data that you transmit to our Services for the purpose of managing 
                performance, as well as data related to your use of the Services. While we perform regular 
                backups, you are solely responsible for all data that you transmit, or that pertains to any 
                activity you have undertaken using the Services. You agree that we shall have no liability 
                for any loss, disclosure, or corruption of such data, and you hereby waive any right of action 
                against us arising from any such incidents.
            </p>
            <h3 class="h3-text" id="subtitle">Data Encryption and Recovery</h3>
            <p class="p-text" style="margin-bottom:32px;">
                Please be aware that we do not retain the ability to read your data. All data—including provenance 
                records and attachments—is fully encrypted and stored in Azure Blob Storage. We do not store your 
                encryption key; we only use it to generate a device ID by applying a SHA256 hash to the device key. 
                We do not retain your device key, and if you lose it, we cannot recover your data. This approach 
                differs from other sites and applications; we intentionally do not have the ability to read your 
                data to enhance your security and privacy.
            </p>
            <h3 class="h3-text" id="subtitle">Electronic Communications, Transactions, and Signatures</h3>
            <p class="p-text" style="margin-bottom:32px;">
                Visiting the Services, sending us emails, and completing online forms constitute electronic 
                communications. You consent to receive electronic communications, and you agree that all agreements, 
                notices, disclosures, and other communications we provide to you electronically, via email, and 
                on the Services satisfy any legal requirement that such communication is in writing.<br><br>

                <strong>You hereby agree to the use of electronic signatures, contracts, orders, and other records, 
                and to electronic delivery of notices, policies, and records of transactions initiated or completed 
                by us or via the services.</strong><br><br>

                You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or 
                other laws in any jurisdiction which require an original signature or delivery or retention of 
                non-electronic records, or to payments or the granting of credits by any means other than electronic 
                means.
            </p>
            <h3 class="h3-text" id="subtitle">California Users and Residents</h3>
            <p class="p-text" style="margin-bottom:32px;">
                If any complaint with us is not satisfactorily resolved, you can contact the ComplaintAssistance Unit 
                of the Division of Consumer Services of the California Department of Consumer Affairs in writing at 
                1625 North Market Blvd., Suite N 112, Sacramento, California 95834 or by telephone at (800) 952-5210 
                or (916) 445-1254.
            </p>
            <h3 class="h3-text" id="subtitle">Miscellaneous</h3>
            <p class="p-text" style="margin-bottom:32px;">
                These Legal Terms and any policies or operating rules posted by us on the Services or with respect 
                to the Services constitute the entire agreement and understanding between you and us. Our failure to 
                exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such 
                right or provision. These LegalTerms operate to the fullest extent permissible by law. We may assign 
                any or all of our rights and obligations to others at any time. We shall not be responsible or liable 
                for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control. If 
                any provision or part of a provision of these Legal Terms is determined to be unlawful, void, or 
                unenforceable, that provision or part of the provision is deemed severable from these Legal Terms 
                and does not affect the validity and enforceability of any remaining provisions. There is no joint 
                venture, partnership, employment, or agency relationship created between you and us as a result of 
                these Legal Terms or use of the Services. You agree that these Legal Terms will not be construed 
                against us by virtue of having drafted them. You hereby waive any and all defenses you may have based 
                on the electronic form of these Legal Terms and the lack of signing by the parties hereto to execute 
                these Legal Terms.
            </p>
            <h3 class="h3-text" id="subtitle">Contact Us</h3>
            <p class="p-text">
                In order to resolve a complaint regarding the Services or to receive further information regarding 
                use of the Services, please contact us at <span style="font-weight: 400;" 
                class="text-decoration-underline"> gosqasystem@gmail.com</span>.
            </p>
        </div>

    </div>
</template>


<style scoped>

a{
    font-weight: normal;
    color: #4e3681;
}

/* For screens smaller than 768px */
@media (max-width: 768px) {
    #terms-and-conditions-container{
        padding: 20px 20px 40px 20px;
    }
    #overview-cols{
        min-width: 390px;
    }
}

/* For screens larger than 768px */
@media (min-width: 768px) {
    #terms-and-conditions-container{
        padding: 80px 200px 100px 200px;
    } 
}

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    #terms-and-conditions-container {
        background-color: #1E2019
    }
    .h1-text {
        color: #CCECFD;
    }
    .h3-text {
        color: #CCECFD;
    }
    .p-text {
        color: #FFFFFF;
    }
    .text-decoration-underline {
        color: #CCECFD;
    }
    .a-text {
        color: #CCECFD;  
    }
  
}
/* Light mode version*/
@media (prefers-color-scheme: light) {
    #terms-and-conditions-container {
        background-color: #FFFFFF;
    }
    .h1-text {
        color: #4E3681;
    }
    .h3-text {
        color: #4E3681;
    }
    .p-text {
        color: #4E3681;
    }
    .text-decoration-underline {
        color: #4E3681;
    }
    .a-text {
        color: #4E3681; 
    }
}

</style>