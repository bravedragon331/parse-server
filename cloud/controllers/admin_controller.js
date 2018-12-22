exports.peripheralList = function(req, res) {
  var SessionItemClass = Parse.Object.extend("SessionItem");
  var query = new Parse.Query(SessionItemClass);
  // query.ascending("date");
  query.limit(100000);
  query.find({
    success: function(results) {
      var items = {};
      for (var i = 0; i < results.length; i++) {
        var id = results[i].get("peripheral_id");
        if (typeof id != 'undefined' ) {
          if (typeof items[id] == 'undefined') {
            items[id] = 0
          }
          items[id] += 1;
        }
      }


      var itemsJson = [];
      for (obj in items) {
        itemsJson.push(obj);
      }


      res.render('admin/peripheral_list', { items: itemsJson });
    },
    error: function(error) {
      res.render('admin/peripheral_list', { items:[] });
    }
    });



}

exports.peripheral = function(req, res) {
  var SessionItemClass = Parse.Object.extend("SessionItem");
  var query = new Parse.Query(SessionItemClass);
  query.ascending("date");

  var peripheralId = req.params.id.replace('.csv','');
  console.log("queriny for peripheralId: ", peripheralId );

  if(typeof req.query.limit != 'undefined') {
    console.log('Querying with Limit: ', req.query.limit);
    query.limit(req.query.limit);
  } else {
    query.limit(100000);
  }
  if(typeof req.query.skip != 'undefined') {
    console.log('Querying with Skip: ', req.query.skip);

    query.skip(req.query.skip);
  }

  query.equalTo("peripheral_id", peripheralId);
  query.find({
    success: function(results) {
      var items = [];
      var moment = require('moment');
      // moment().format();
      var text = ""
      for (var i = 0; i < results.length; i++) {
        var pulses = results[i].get("vape_pulses");
        for (var p = 0; p < pulses.length; p++) {
          // text += '"' + pulses[p] + '",';
          text += '"' + moment(pulses[p]).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z",';

          // items.push('"' + moment(pulses[p]).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z", ');
         // items.push(pulses[p])
        }

      }
      res.send(text);
      // res.render('admin/peripheral', { items: items });
    },
    error: function(error) {
      res.render('admin/peripheral', { items:[] });
    }
    });



}
