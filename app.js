//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

const day = date.getDate();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://Khushi_766_Sangal:%23K%40atlas766@cluster0.p0ed3.mongodb.net/todolistDB", { useNewUrlParser: true});

const itemSchema = new mongoose.Schema ({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
  name: "Get Up!"
});

const item2 = new Item ({
  name: "Drink Water"
});
const item3 = new Item ({
  name: "Go for a walk"
});

const defaultItems = [ item1, item2, item3 ];

const listSchema = mongoose.Schema ({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {


  //READ OPERATION

  Item.find({}, function(err, foundItems){

    if( foundItems.length === 0){

      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else {
          console.log("Insertion Successful!");
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: day, newListItems: foundItems});
    }

  });




});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

    const item = new Item ({
      name: itemName
    });

    if(listName === day){
      item.save();
      res.redirect("/");
    }
    else {
      List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }

});


app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day) {
    Item.findByIdAndRemove( checkedItemId, function(err){
      if(!err){
        console.log("Deletion Successful!");
        res.redirect("/");
      }
    });
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});


app.get("/about", function(req, res){
  res.render("about");
});


app.get("/:customListName", function(req, res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //Create a new list
        const list = new List ({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      }
      else {
        //Show an existing list
        res.render("list", {listTitle: foundList.name , newListItems: foundList.items });
      }
    }
  });


});


let port = process.env.PORT;
if(port == null || port == "") {
  port = 3000;
};

app.listen(port, function() {
  console.log("Server started successfully!");
});
