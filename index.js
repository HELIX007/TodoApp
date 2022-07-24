//jshint esversion:6
//default settings
const express = require('express');
const bodyParser = require('body-parser');

const app= express();
const mongoose = require('mongoose');
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extented:true}));

 mongoose.connect("mongodb://localhost:27017/todolistDB");
const itemschema ={
  name: String
};
console.log("helo world");

const Item = mongoose.model("Item",itemschema);
const data1 = new Item({
  name: "Welcome to your todolist"
});
const data2 = new Item({
  name: "Hit the + to add a new item"
});
const data3 = new Item({
  name:"<-- Hit this to delete an item."
});

const defaultdata = [data1, data2, data3];

const  Listschema ={
  name : String,
  items : [itemschema]
} ;

const List = mongoose.model("List", Listschema);

//Get function
app.get("/", function(req, res) {
  Item.find({}, function(err, founditems)
{
  if(founditems.length === 0) {
    Item.insertMany(defaultdata, function(err){
      if (err) {
        console.log(err);
      }
      else {
        console.log("successfully added items to database");
      }
    });
    res.redirect("/");
  }else{
    res.render("list", {ListTitle :"Today" , newListItems : founditems});

  }
});

});

app.get("/:customList", function(req, res){
  const customList = req.params.customList;
  List.findOne( {name :customList}, function(err, foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
          name: customList ,
          items :defaultdata
        });
        list.save();
        res.redirect("/" + customList);
      }
      else{
        res.render("list", {ListTitle: foundlist.name , newListItems : foundlist.items});
      }
    }
  });
});
//Post function
app.post("/", function(req, res) {
const itemName = req.body.newItem;
const Listname = req.body.list;
const item= new Item({
  name : itemName
});
if(Listname === "Today"){
  item.save();
  res.redirect("/");

}
else{
  List.findOne({name :Listname}, function(err, foundlist){
    foundlist.items.push(item);
    foundlist.save();
    res.redirect("/" + Listname);
  });
}
});


app.post("/delete", function(req, res) {
  const checkeditem = req.body.checkbox;
  //console.log(checkeditem);
  Item.findByIdAndDelete(checkeditem,function(err){
    console.log(checkeditem);
    if (! err) {
      console.log("Successfully deleted item");
      res.redirect("/");
    }
    else {
      console.log("Error deleting item")
    }
  });
});



app.get("/about", function(req, res) {
  res.render("about");
});



//listen function
app.listen(3000, function(req, res){
  console.log("Successfully started listening on 3000");
});
