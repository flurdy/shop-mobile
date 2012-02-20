package models

case class ShoppingItem(name: String, description: String, var isPurchased: Boolean){
//  var isPurchased = false
  def this(name: String){
    this(name,"",false)
  }
  def this(name: String, description: String){
    this(name,"",false)
  }
  def markAsPurchased {
    isPurchased = true
  }
}
