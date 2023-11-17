// Allows user to select a thumbs up or thumbs down rating to be stored with their entry.
import html from './html.js';

export default {
    name: 'ThumbsRating',
    props: {
        'thumbsUp': {
            type: Boolean,
            default: null,
        },
    },
    data() {
        return {
            thumbsUp: this.thumbsUp,
        };
    },

    render() {
        return html`
<div class="thumbs-rating">

    <button type="button" class="btn btn-primary" @click=${() => {
            this.thumbsUp = true;
        }}>
        <i class="bi bi-hand-thumbs-up"></i>
    </button>

    <button type="button" class="btn btn-primary" @click=${() => {
            this.thumbsUp = false;
        }}>
        <i class="bi bi-hand-thumbs-down"></i>
    </button>

</div>
`;
    }
};
