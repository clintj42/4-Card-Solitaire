var suitSize = 13;
var deck = [];
var freeDiscards = 3;
var usingFreeDiscard = false;
var moveList = [];
var sections = [];
var dragging = false;

$(document).on("click touchend", ".card", function(e){
	if(!dragging) {
		$(this).css("z-index", "100");
		$(this).css("transform", "0");
		$(this).attr("data-x", "0");
		$(this).attr("data-y", "0");
		clickCard($(this));
	} else {
		dragging = false;
	}
});

$(document).ready(function() {
	if(window.location.href.indexOf("tutorial2") !== -1 || window.location.href.indexOf("tutorial3") !== -1) {
		freeDiscards = 0;
	}
	
	$("#freeDiscardLabel").text("Free Discards: " + freeDiscards);
	
	var suits = ["hearts","spades","clubs","diamonds"];
	for(var i = 0; i < suits.length; i++) {
		for(var j = 1; j <= suitSize; j++) {
			deck.push(new Card(j, suits[i]));
		}
	}
	$("#deck").click(function() {
		draw();
	});
	
	interact('.card:last-child').draggable({
		inertia: false,
		restrict: {
			restriction: document.getElementById("body"),
			endOnly: true,
			elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
		},
		autoScroll: false,
		onmove: dragMoveListener
	});
	
	interact("#body").dropzone({
		accept: ".card",
		overlap: 0.75,
		ondrop: function(event) {
			event.relatedTarget.style.zIndex = 100;
			event.relatedTarget.style.transform = "none";
			event.relatedTarget.setAttribute("data-x", 0);
			event.relatedTarget.setAttribute("data-y", 0);
		}
	});

	interact('.cardSection').dropzone({
		accept: '.card',
		overlap: 0.75,
		ondrop: function (event) {
			event.relatedTarget.style.zIndex = 100;
			event.relatedTarget.style.transform = "none";
			event.relatedTarget.setAttribute("data-x", 0);
			event.relatedTarget.setAttribute("data-y", 0);
			
			console.log(event.target.getAttribute("id"));
			var sectionDragTo = parseInt(event.target.getAttribute("id").replace("section","")) - 1;
			var sectionDragFrom = parseInt(event.relatedTarget.parentElement.getAttribute("id").replace("section","")) - 1;
			if(sectionDragFrom === sectionDragTo) {
				clickCard(jQuery(event.relatedTarget));
				return;
			}
			
			//Dragging
			if(window.location.href.indexOf("tutorial2") === -1){
				var isEmpty = true;
				var jqueryTarget = jQuery(event.target);
				jqueryTarget.children().each(function() {
					console.log($(this).attr("value"));
					if($(this).attr("value") !== "") {
						isEmpty = false;
					}
				});
				if(isEmpty) {
					var card = sections[sectionDragFrom].shift();
					sections[sectionDragTo].unshift(card);
					displayCards();
					moveList.push("drag|" + event.relatedTarget.parentElement.getAttribute("id") + "|" + event.target.getAttribute("id").replace("section",""));
					checkEndGame();
					if(window.location.href.indexOf("tutorial3") !== -1) {
						$("#instruction2").text("Great job!");
						$("#instruction2").show();
						scrollToInstruction();
					}
				} else if(window.location.href.indexOf("tutorial") !== -1) {
					$("#instruction2").text("You cannot drag to a pile unless it is empty.");
					$("#instruction2").show();
					scrollToInstruction();
				}
			}	
		}
	});
	
	$("#undoButton").click(function() {
		undo();
	});
	
	$("#playAgainButton").click(function() {
		window.location.reload();
	});
	
	$("#newGameButton").click(function() {
		window.location.reload();
	});
	
	$("#modalUndoButton").click(function() {
		undo();
	});
	
	$(".lightbulb").click(function() {
		window.location.href = "tutorial1.html";
	});
	
	shuffle(deck);
	
	var section1 = [];
	var section2 = [];
	var section3 = [];
	var section4 = [];
	sections.push(section1);
	sections.push(section2);
	sections.push(section3);
	sections.push(section4);
	
	setMinSectionHeight();
	draw();
});



function dragMoveListener (event) {
	dragging = true;
	event.target.style.zIndex = 999;
    var target = event.target,
		// keep the dragged position in the data-x/data-y attributes
		x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
		y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
		target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;


function undo() {
	if(moveList.length > 1) {
		var lastMove = moveList.pop();
		var type = lastMove.split("|")[0];
		switch(type) {
			case "click":
				var card = new Card(parseInt(lastMove.split("|")[1]), lastMove.split("|")[2]);
				var sectionIndex = parseInt(lastMove.split("|")[3].replace("section", "")) - 1;
				sections[sectionIndex].unshift(card);
				displayCards();
				break;
			case "clickFreeDiscard":
				var card = new Card(parseInt(lastMove.split("|")[1]), lastMove.split("|")[2]);
				var sectionIndex = parseInt(lastMove.split("|")[3].replace("section", "")) - 1;
				sections[sectionIndex].unshift(card);
				freeDiscards++;
				$("#freeDiscardLabel").text("Free Discards: " + freeDiscards);
				displayCards();
				break;
			case "draw":
				for(var i = 3; i >= 0; i--) {
					var card = sections[i].shift();
					deck.push(card);
				}
				displayCards();
				$("#deckCountLabel").text("Deck: " + deck.length);
				$("#deck").css("visibility", "visible");
				break;
			case "drag":
				var draggedFromIndex = parseInt(lastMove.split("|")[1].replace("section", "")) - 1;
				var draggedToIndex = parseInt(lastMove.split("|")[2].replace("section", "")) - 1;
			
				var card = sections[draggedToIndex].shift();
				sections[draggedFromIndex].unshift(card);
				displayCards();
				break;
		}
	}
}

function setMinSectionHeight() {
    if($(".card").length === 0 || $(".card").height() === 0 || $(".card").width() === 0) {
		setTimeout( setMinSectionHeight, 100 );
	}
	$('html, body').animate({scrollTop: $(document).height()});
	$(".cardSection").css("min-height", $(".card").height() + "px");
	$("#deck").css("width", $(".card").width());
	var cardHeight = $(".card").height() * .8; //80% of card height
	for(var i = 0; i < sections.length; i ++) {
		$("#section"+(i + 1)+" .card").each(function(index) {
			if(index !== 0) {
				$(this).css("margin-top", "-" + cardHeight + "px");
			}
		});
	}
}



function draw() {
	if (deck.length > 0) {
		for(var i = 0; i < sections.length; i++) {
			var card = deck.pop();
			sections[i].unshift(card);
		}
		displayCards();
		
		moveList.push("draw");
	} 
	if(deck.length === 0) {
		$("#deck").css("visibility", "hidden");
	}
	$("#deckCountLabel").text("Deck: " + deck.length);
	checkEndGame();
}

function displayCards() {
	for(var i = 0; i < sections.length; i++) {
		$($("#section" + (i + 1) + " .card").get().reverse()).each(function(j) {
			if(j < sections[i].length) {
				$(this).attr("src", "images/" + sections[i][j].getValue() + "_of_" + sections[i][j].getSuit() + ".png");
				$(this).attr("value", sections[i][j].getValue() + "|" + sections[i][j].getSuit());
			} else {
				$(this).attr("src","images/blank.png");
				$(this).attr("value", "");
			}
		});
	}	
}

function checkEndGame() {
	if(deck.length === 0) {
		var noDrags = true;
		var noClicks = true;
		for(var i = 0; i < sections.length; i++) {
			if(sections[i].length === 0) {
				noDrags = false;
			}
		}
		
		$(".cardSection .card:last-child").each(function() {
			if(canClick($(this))) {
				noClicks = false;
			}
		});
		if(noDrags && noClicks) {
			var win = true;
			for(var i = 0; i < sections.length; i++) {
				if(sections[i].length !== 1) {
					win = false;
				}
			}
			if(win) {
				$("#section1").parent().css("display","none");
				$("#deckContainer").hide();
				$("#playAgainButton").show();
				$("#winTitle").show();
				showFireworks();
			} else {
				$('#loseModal').modal({
				  backdrop: 'static',
				  keyboard: false
				});
			}
		}
	}
}

function clickCard(card) {
	if(card.is(':last-child')) {
		if(canClick(card)) {
			var clickedValue = parseInt(card.attr("value").split('|')[0]);
			var clickedSuit = card.attr("value").split('|')[1];
			if(usingFreeDiscard) {
				if(window.location.href.indexOf("tutorial4") !== -1) {
					$("#instruction2").text("Great job. You just used a free discard.");
					$("#instruction2").show();
					scrollToInstruction();
				}
				freeDiscards--;
				$("#freeDiscardLabel").text("Free Discards: " + freeDiscards);
				card.animate({
					top: '100px'
				}, 1000, function() {
					card.animate({opacity:.1}, function() {
						$("#freeDiscardLabel").fadeOut('slow', function(){
							$(this).fadeIn('slow', function(){
								//blink(this);
							});
						});
						var sectionIndex = parseInt(card.parent().attr("id").replace("section","")) - 1;
						sections[sectionIndex].shift();
						displayCards();
						checkEndGame();
						card.css("top", "0");
						card.css("opacity", "1");
					});
				});
				moveList.push("clickFreeDiscard|" + clickedValue + "|" + clickedSuit + "|" + card.parent().attr("id"));
			} else {
				moveList.push("click|" + clickedValue + "|" + clickedSuit + "|" + card.parent().attr("id"));
				var sectionIndex = parseInt(card.parent().attr("id").replace("section","")) - 1;
				sections[sectionIndex].shift();
				displayCards();
				checkEndGame();
			}
		} else if(window.location.href.indexOf("tutorial2") !== -1 || window.location.href.indexOf("tutorial3") !== -1) {
			$("#instruction2").text("There are no top cards of higher value and the same suit as this card.");
			$("#instruction2").show();
			scrollToInstruction();
		}
	} else if(window.location.href.indexOf("tutorial") !== -1) {
		$("#instruction2").text("You can only click on the top cards");
		$("#instruction2").show();
		scrollToInstruction();
	}
}

function canClick(card) {
	usingFreeDiscard = false;
	var ret = false;
	var clickedValue = parseInt(card.attr("value").split('|')[0]);
	var clickedSuit = card.attr("value").split('|')[1];
	if(isNaN(clickedValue)) {
		ret = false;
	} else {
		$(".cardSection .card:last-child").each(function() {
			var value = parseInt($(this).attr("value").split('|')[0]);
			var suit = $(this).attr("value").split('|')[1];
			if(value !== clickedValue || suit !== clickedSuit) {
				if(suit === clickedSuit && value > clickedValue) {
					if(window.location.href.indexOf("tutorial2") !== -1) {
						var newValue = value === 1 ? "Ace" : value === 11 ? "Jack" : value === 12 ? "Queen" : value === 13 ? "King" : value;
						var newClickedValue = clickedValue === 1 ? "Ace" : clickedValue === 11 ? "Jack" : clickedValue === 12 ? "Queen" : clickedValue === 13 ? "King" : clickedValue;
						$("#instruction2").text("Great job. The " + newValue + " of " + suit + " cancelled the " + newClickedValue + " of " + clickedSuit);
						$("#instruction2").show();
						scrollToInstruction();
					}
					ret = true;
				}
			}
		});
		if(ret === false && freeDiscards > 0 && clickedValue !== 13) {
			usingFreeDiscard = true;
			ret = true;
		}
	}
	
	return ret;
}

function scrollToInstruction() {
	if($("#instruction2").position()){
		if($("#instruction2").position().top < $(window).scrollTop()){
			//scroll up
			$('html,body').animate({scrollTop:$("#instruction2").position().top}, 1000);
		}
		else if($("#instruction2").position().top + $("#instruction2").height() > $(window).scrollTop() + (window.innerHeight || document.documentElement.clientHeight)){
			//scroll down
			$('html,body').animate({scrollTop:$("#instruction2").position().top - (window.innerHeight || document.documentElement.clientHeight) + $("#instruction2").height() + 50}, 1000);
		}
	}
}

var Card = function(value, suit) {
	this.value = value;
	this.suit = suit;
	
	this.getValue = function() {
		return this.value;
	}
	
	this.getSuit = function() {
		return this.suit;
	}
	
	this.print = function() {
		console.log(this.value + " of " + this.suit);
	}
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}