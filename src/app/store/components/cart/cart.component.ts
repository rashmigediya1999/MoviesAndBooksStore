import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/shared/services/product.service';
import { IpServiceService } from 'src/app/shared/services/ip-service.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Movie, Book } from 'src/app/models/movie';
import { Cart } from 'src/app/models/cart';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  userDetails: FormGroup;
  ProductsList: any = [];
  cartList: any = [];
  Movies: any = [];
  Books: any = [];
  category: string;
  totalAmount =0;
  updateMovie : Movie;
 updateBook: Book;
 updateCart: Cart;


  constructor(
    private productService: ProductService,
    private formBuilder: FormBuilder,
    private router : Router
  ) {
    
   }

  ngOnInit(): void {
    this.userDetails = this.formBuilder.group({
      username: ['', Validators.required],
      email: [null, [Validators.required, Validators.email]],
      address: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['', Validators.required],
      upiId: ['', Validators.required],
    });
    this.loadMovies();
  }

  loadMovies()
  {
    this.productService.GetMovies().subscribe((data:any)=>{  
      this.Movies=data;  
      this.loadBooks();
  });    
  }

  loadBooks()
  {
    this.productService.GetBooks().subscribe((data: any) =>{
      this.Books = data;
      this.loadCartProducts();
    });
    
  }

  loadCartProducts() 
  {   
    this.productService.GetCartProducts().subscribe((data: {}) => {
      this.cartList = data;

      this.findCart();
    });
  }

  findCart() {

    for (let i = 0; i <= this.cartList.length - 1; i++) {
      // console.log(this.wishlist[i].category);
      this.category = this.cartList[i].category;
      if (this.category === 'Movie') {
        let movie = this.Movies.filter(e => e.id === this.cartList[i].productId);
        movie[0].Cartqty = this.cartList[i].cartQuantity;
        this.totalAmount += movie[0].amount;
        this.ProductsList.push(movie[0]);
      }
      else {
        let book = this.Books.filter(e => e.id === this.cartList[i].productId);
        book[0].Cartqty = this.cartList[i].cartQuantity;
        this.totalAmount += book[0].amount;
        this.ProductsList.push(book[0]);
      }
    }
    console.log(this.ProductsList)
  }

  saveDetails() {
    if (this.userDetails.valid) {      
      localStorage.setItem('UserDetails',JSON.stringify(this.userDetails.value));
      this.router.navigate(['/checkout']);      
    }
  }

  DeletefromCart(product, index) {
 
    if (product.Cartqty == 1) {
      this.totalAmount -= product.amount;
      let item = this.cartList.find(e => e.productId === product.id && e.category == product.category);
      if (item != null) {
        // var index  = this.ProductsList.map(x => {return x.product_name}).indexOf(data.product_name);
        return this.productService.RemoveCartProduct(item.id).subscribe(res => {
          this.ProductsList.splice(index, 1)
          this.productService.cartCount -= 1;              
        })
      }
    }
    else {
      product.Cartqty -= 1;
      this.totalAmount -= product.amount;
      if(product.category == 'Movie')
      {
         this.productService.GetMovie(product.id).subscribe((data) => {
          this.updateMovie = data;
          this.updateMovie.quantity += 1;

          this.productService.UpdateMovie(product.id, this.updateMovie).subscribe(res => {            
          })

        });
      }
      else{
        this.productService.GetBook(product.id).subscribe((data) => {
          this.updateBook = data;
          this.updateBook.quantity += 1;

          this.productService.UpdateBook(product.id, this.updateBook).subscribe(res => {            
           // console.log("Updated Book");
          })

        });
      }

      let list = this.cartList.find(element => 
        element.category === product.category
          && element.productId === product.id
          ); 
         // console.log(list);
       if(list !=  null)
         { 
          this.productService.GetCartItem(list.id).subscribe((data) => {
            this.updateCart = data;
            this.updateCart.cartQuantity -= 1;

            this.productService.UpdateCartItem(list.id, this.updateCart).subscribe(res => {
              // this.ngZone.run(() => this.router.navigateByUrl('/productcrud'))
              // this.loadBooks();
            //  console.log("Updated cart");
            })

          });
          }

    }
  }

  IncrementCartItem(product)
  {
    product.Cartqty += 1;
    this.totalAmount += product.amount;
       if(product.category == 'Movie')
          {
             this.productService.GetMovie(product.id).subscribe((data) => {
              this.updateMovie = data;
              this.updateMovie.quantity -= 1;

              this.productService.UpdateMovie(product.id, this.updateMovie).subscribe(res => {
                // this.loadMovies();
               
              //  console.log("Updated Movie...in cart");
              })

            });
          }
          else{
            this.productService.GetBook(product.id).subscribe((data) => {
              this.updateBook = data;
              this.updateBook.quantity -= 1;

              this.productService.UpdateBook(product.id, this.updateBook).subscribe(res => {
                // this.ngZone.run(() => this.router.navigateByUrl('/productcrud'))
                // this.loadBooks();
              //  console.log("Updated Book");
              })
            });
          }

          let list = this.cartList.find(element => 
            element.category === product.category
              && element.productId === product.id
              ); 
            //  console.log(list);
           if(list !=  null)
             { 
              this.productService.GetCartItem(list.id).subscribe((data) => {
                this.updateCart = data;
                this.updateCart.cartQuantity += 1;
  
                this.productService.UpdateCartItem(list.id, this.updateCart).subscribe(res => {                 
                //  console.log("Updated cart");
                })
  
              });
              }

  }


}
