/*
This is the JS script which is used for the Intro to Vue.
*/

// Global channel through which we can send data
var eventBus = new Vue({
	
})

// Product review comp
Vue.component('product-review', {
	//props: {
	//},
	template: `
		<form class="review-form" @submit.prevent="onSubmit">
		
		<!-- Form validation for the app -->
		<p v-if="errors.length">
			<b>Please correct the following error(s):</b>
			<ul>
				<li v-for="error in errors">{{ error }}</li>
			</ul>
		</p>
		
		<p>
			<label for="name">Name:</label>
			<input id="name" v-model="name">
		</p>
		
		<p>
			<label for="review">Review:</label>
			<textarea id="review" v-model="review"></textarea>
		</p>
		
		<p>
			<label for="rating">Rating:</label>
			<select id="rating" v-model.number="rating">
				<option>5</option>
				<option>4</option>
				<option>3</option>
				<option>2</option>
				<option>1</option>
			</select>
		</p>
		
		<p>
			<label for="question">Would you recommend this item?</label>
			<select id="question" v-model="question">
				<option>Yes</option>
				<option>No</option>
			</select>
		</p>
		
		<p>
			<input type="submit" value="Submit">
		</p>
	`,
	data() {
		return {
			name: null,
			review: null,
			rating: null,
			question: null,
			errors: []
		}
	},
	methods: {
		onSubmit() {
			if (this.name && this.review && this.rating && this.question) {				
				let productReview = {
					name: this.name,
					review: this.review,
					rating: this.rating,
					question: this.question
				}
				eventBus.$emit('review-submitted', productReview)
				// This reset the data value after being submitted
				this.name = null,
				this.review = null,
				this.rating = null,
				this.question = null
			} else {
				if (!this.name) this.errors.push("Name required.")
				if (!this.rating) this.errors.push("Rating required.")
				if (!this.review) this.errors.push("Review required.")
				if (!this.question) this.errors.push("Answer to question required.")
			}
		}
	}
})

// Product comp (main)
Vue.component('product', {
	props: {
		premium: {
			type: Boolean,
			required: true
		}
	},
	template: `
		<div class="product">
				<div class="product-image">
					<img :src="image">
				</div>
				
				<div class="product-info">
					<h1>{{ title }}</h1>
					<p v-if='inStock'>In Stock</p>
					<p v-else :class="{outOfStock: !inStock}">Out of Stock</p>
					<p>{{ sale }}</p>
					
					<ul>
						<li v-for='detail in details'>{{ detail }}</li>
					</ul>
					<ul>
						<li v-for='size in sizes'>{{ size }}</li>
					</ul>
					
					<div v-for="(variant, index) in variants" 
						:key="variant.variantId"
						class="color-box"
						:style="{ backgroundColor: variant.variantColor }" 
						@mouseover="updateProduct(index)">
					</div>
					
					<!-- Buttons! -->
					<button @click="addToCart" 
							:disabled="!inStock"
							:class="{ disabledButton: !inStock}">Add to Cart</button>
					<button @click="removeFromCart">Remove From Cart</button>
					
				</div>
				<product-tabs :reviews="reviews"></product-tabs>
				
			</div>
	`,
	data() {
		return  {
			brand: 'Vue Mastery',
			product: 'Socks',
			selectedVariance: 0,
			onSale: false,
			details: ["80% Cotton", "20% Polyester", "Gender-neutral"],
			sizes: ["Small", "Medium", "Large", "X-Large"],
			variants: [
				{
				variantID: 1,
				variantColor: 'green',
				variantImage: './Assets/vmSocks-green-onWhite.jpg',
				variantQuantity: 10
				},
				{
				variantID: 2,
				variantColor: 'blue',
				variantImage: './Assets/vmSocks-blue-onWhite.jpg',
				variantQuantity: 10
				}
			],
			reviews: []
			}
	},
	methods: {
		/* Could be functionName: function() or like below, but not all 
		browser support the method used below
		*/
		addToCart() {
			this.$emit('add-to-cart', this.variants[this.selectedVariance].variantID)
		},
		removeFromCart() {
			this.$emit('remove-from-cart', this.variants[this.selectedVariance].variantID)
		},
		updateProduct(index) {
			this.selectedVariance = index
		}
	},
	computed: {
		title() {
			return this.brand + ' ' + this.product
		},
		image() {
			return this.variants[this.selectedVariance].variantImage
		},
		inStock() {
			return this.variants[this.selectedVariance].variantQuantity
		},
		sale() {
			if (this.onSale)
				return this.brand + ' ' + this.product + ' are on sale!'
			return this.brand + ' ' + this.product + ' are not on sale!'
		}
	},
	mounted() { // lifecycle hook
		eventBus.$on('review-submitted',productReview => {
			this.reviews.push(productReview)
		})
	}
})

// Product tabs comp
Vue.component('product-tabs', {
	props: {
		reviews: {
			type: Array,
			required: true
		}
	},
	template: `
		<div>
			<span class="tab"
					:class="{ activeTab: selectedTab === tab}"
					v-for="(tab, index) in tabs" 
					:key="index"
					@click="selectedTab = tab">{{ tab }}</span>
		<div>
		
		
		<div v-show="selectedTab === 'Reviews'">
			<p v-if="!reviews.length">There are no reviews yet.</p>
			<ul v-else>
				<li v-for="(review,index) in reviews"
				:key="index">
				<p>{{ review.name }}</p>
				<p>Rating: {{ review.rating }}</p>
				<p>{{ review.review }}</p>
				<p>Would you recommend this item? {{ review.question }}</p>
				</li>
			</ul>
		</div>
		
		<product-review v-show="selectedTab === 'Make a Review'"></product-review>
		
		<div v-show="selectedTab === 'Shipping'">
			<p>Shipping: {{ shipping }} dollars</p>
		</div>
	`,
	data () {
		return {
			tabs: ['Reviews', 'Make a Review','Shipping','Details'], // Still need to setup the details tab
			selectedTab: 'Reviews'
		}
	},
	computed: {
		shipping() {
			if (this.premium)
				return "Free!"
			return 2.99
		}
	}
})

// App variable
var app = new Vue({
	el: "#app",
	data: {
		cart: [],
		premium: true // how to pass this to the product tab component (-_-)
	},
	methods: {
		updateCart(id) {
			this.cart.push(id)
		},
		removeItem(id) {
			for(var i = this.cart.length - 1; i >= 0; i--) {
				if(this.cart[i] === id) {
				   this.cart.splice(i, 1);
				   break
				}
			}
		}
	}
})