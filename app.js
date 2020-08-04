// BUDGET CONTROLLER
var budgetcontroller = (function() {
   
  var Expense = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
     
    if (totalIncome > 0) {
      this.percentage  = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }  
  };
  
  Expense.prototype.getPercentage = function() {
      return this.percentage;
  };
  

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
     var sum = 0;

     data.allItems[type].forEach(function(cur){
        sum = sum + cur.value;
     });

     data.totals[type] = sum;
  };


  var data = {
     allItems: {
       exp: [],
       inc: []
     },
     totals: {
       exp: 0,
       inc: 0
     },
     budget: 0,
     percentage: -1
  };

  return {
      addItem: function(type, des, val) {
         var newItem, ID;
          
         // Create new ID
         if (data.allItems[type].length > 0) {
             ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
         } else {
            ID = 0;
         }

          // Create new item based on 'inc' or 'exp' type
         if(type === 'exp') {
             newItem = new Expense(ID, des, val);
         } else if (type === 'inc') {
             newItem = new Income(ID, des, val);
         }
        
         // Push it into our data structure
         data.allItems[type].push(newItem);

         // Return the new element
         return newItem;
      },
    
      deleteItem: function(type, id) {
       /* var ids, index;

        ids = data.allItems[type].map(function(current) {
          return current.id;  
        });

        index = ids.indexOf(id);

        if (index !== -1) {
          data.allItems[type].splice(index, 1);
        } */
      },

      CalculateBudget: function() {

          // 1. calculate total income and expenses
           calculateTotal('exp');
           calculateTotal('inc');

          // 2. calculate the the budget: income - expanses
          data.budget = data.totals.inc - data.totals.exp;

          // 3. calculate the  percentage of income that we spent
          if (data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
          } else {
            data.percentage = -1;
          }
      
      },
      
      CalculatePercentages: function() {

        data.allItems.exp.forEach(function(cur) {
            cur.calcPercentage(data.totals.inc);
        });
      },
    

      getPercentage: function() {
        var allPerc = data.allItems.exp.map(function(cur) {
            return cur.getPercentage();
        });
        return allPerc;
      },

      getBudget: function() {
         return {
            budget: data.budget,
            totalInc: data.totals.inc ,
            totalExp: data.totals.exp,
            percentage: data.percentage
         };
      },

      testing: function() {
        console.log(data);
      }
      
  };
     
})(); 

// UI CONTROLLER
var UIController = (function() {
  
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: 'add__btn'
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length -3) + ',' + int.substr(int.length - 3, 3);
    }
     
    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
       callback(list[i], i);
    }
 };



  return {
    getInput: function() {
      return {
         type: document.querySelector('.add__type').value,
         description: document.querySelector('.add__description').value,
         value: parseFloat(document.querySelector('.add__value').value) 
      };
    },

    addListItem: function(obj, type) {
        var html, element;
      // Create HTML string with placeholder text
      if (type === 'inc') { 
        element = '.income__list';
        html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>
        <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">
        <button class="item__delete--btn"><i class="icon-arrows-circle-remove"></i></button></div></div></div>`;
      } else if (type === 'exp') {
        element = '.expenses__list';
        html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>
            <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>
            <div class="item__delete"><button class="item__delete--btn"><i class="icon-arrows-circle-remove"></i></button></div></div></div>`;
      }
      // Replace the placeholder text with some actual data
        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      // Insert the HTML into the DOM
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArr;
      
      fields =  document.querySelectorAll('.add__description' + ',' + '.add__value');

       fieldsArr = Array.prototype.slice.call(fields);

       fieldsArr.forEach( (current) => {
           current.value = "";
       });
   
       fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
        var type;
        obj.budget > 0 ? type = 'inc' : type = 'exp';

        document.querySelector('.budget__value').textContent = formatNumber(obj.budget, type);
        document.querySelector('.budget__income--value').textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector('.budget__expenses--value').textContent = formatNumber(obj.totalExp, 'exp');


        if (obj.percentage > 0) {
          document.querySelector('.budget__expenses--percentage').textContent = obj.percentage + '%';
        } else {
          document.querySelector('.budget__expenses--percentage').textContent = "-";
        }
    },


    displayPercentages: function(percentages) {

      var fields = document.querySelectorAll('.item__percentage'); 


      nodeListForEach(fields, function(current, index){
         
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '--';
        }     
      });
    },

    displayMouth: function() {
      var now, months, month, year;

      now = new Date();
      
      months = ['January', 'February', 'March', 'April', 'May', 
                'June', 'July', 'August', 'September', 'October', 
                'November', 'December'];
       
      month = now.getMonth();


      year = now.getFullYear();
      document.querySelector('.budget__title--month').textContent = months[month] + ' ' + year;

    },

    changedType: function() {

     var fields = document.querySelectorAll(   
     DOMstrings.inputType + ',' + DOMstrings.inputDescription
     + ',' + DOMstrings.inputValue);

      nodeListForEach(fields, function(cur){
         cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },


    getDOMstrings: function() {
      return DOMstrings;
    }
 
  };

})();


//  GLOBAL APP CONTROLLER
var controller = (function(budgetcontrl, UICtrl) {

     var setupEventListeners = function() {   
       // Adding event handler
        document.querySelector('.add__btn').addEventListener('click', ctrlAddItems);

        document.addEventListener('keypress', function(event){
           if(event.keyCode === 13 || event.keyCode === 13){
                 // Calling ctrlAddItems function
                   ctrlAddItems();
           }
        });

        document.querySelector('.container').addEventListener('click', ctrlDeleteItem);

        document.querySelector('.add__type').addEventListener('change', UICtrl.changedType);
     };

     var UpdateBudget = function() {

      // 1. Calculate the budget
        budgetcontrl.CalculateBudget();
      // 2. Return the budget
        var budget = budgetcontrl.getBudget();
      // 3. Display the budget on the UI
       UICtrl.displayBudget(budget);
     }

   var updatePercentages = function() {

     // 1. Calculate percentages
      budgetcontrl.CalculatePercentages();
     // 2. Read percentages from the budget controller
      var percentages = budgetcontrl.getPercentage();
     // 3. Update the UI with the new percentages
      UICtrl.displayPercentages(percentages);
   }

  var ctrlAddItems = function() {
      var input, newItem;
    // 1. Get input  values
       input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0 ) {
        
    // 2. Add the new item to our data structure
    newItem = budgetcontrl.addItem(input.type, input.description, input.value);

    // 3. Add the new item to the UI
      UICtrl.addListItem(newItem, input.type);
     
    // 4. Clear the fields
      UICtrl.clearFields();
    
    // 5. Calculate and update budget
     UpdateBudget();

     // 6. calculate and update percentages
       updatePercentages();

    }
     
  };
   
  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;
     
     itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; 

     if (itemID) {
      splitID = itemID.split('--');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from the data structure
       budgetcontrl.deleteItem(type, ID);

      // 2. Delete the item from the UI
       UICtrl.deleteListItem(itemID);

      // 3. Update and show the new budget
       UpdateBudget();

      // 4. calculate and update percentages
        updatePercentages();
     }
  };
  


  return {
     init: function(){
       console.log('Application has started')
       UICtrl.displayMouth();
       UICtrl.displayBudget( {
           budget: 0,
           totalInc: 0,
           totalExp: 0,
           percentage: -1});

        setupEventListeners();
     }
  };

})(budgetcontroller, UIController);


controller.init();