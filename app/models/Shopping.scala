package models

import play.Logger

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
  def markAsNotPurchased {
    isPurchased = false
  }
}

case class ShoppingList(){
  var list:List[ShoppingItem] = List()
  def this(newList:List[ShoppingItem])  {
    this()
    this.list = newList
    reorderListByPurcased
  }
  def addItem(shoppingItem:ShoppingItem) {
    val itemFind = list.find{ item => item.name == shoppingItem.name }
    itemFind match {
      case None =>  list ::= shoppingItem
      case Some(item) => {
        Logger.warn("Unique name required")
        val existingItem = removeItem(shoppingItem.name)
        existingItem.markAsNotPurchased
        addItem(existingItem)
      }
    }
  }
  def removeItem(name:String):ShoppingItem = {
    val item = findItem(name)
    list = list.filter { item => item.name != name }
    item
  }
  def updateItem(shoppingItem:ShoppingItem) {
    list = list.map { case i => if (i.name == shoppingItem.name) shoppingItem else i }
  }

  def findItem(name: String): ShoppingItem = {
    val itemFind = list.find{ item => item.name == name }
    itemFind match {
      case None =>  sys.error("No item found")
      case Some(item) => item
    }
  }
  def purchaseItem(name: String){
    val shoppingItem: ShoppingItem = findItem(name)
    shoppingItem.markAsPurchased
    reorderListByPurcased
  }
  def reorderListByPurcased {
    list = list.filter { item => !item.isPurchased } ++ list.filter { item => item.isPurchased }
  }
}