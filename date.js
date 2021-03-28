exports.getDate = function getDate() {

  var today = new Date();
  var currentDay = today.getDay();
  var options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  }

  var day = today.toLocaleDateString("en-US", options);
  return day;
}


exports.getDay = function getDay() {

  var today = new Date();
  var currentDay = today.getDay();
  var options = {

    day: "numeric",

  }

  var day = today.toLocaleDateString("en-US", options);
  return day;
}
