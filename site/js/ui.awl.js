(function (window) {

  var equipmentModal;
  var pluginNotFoundModal;
  var autoPlayModal;

  //var weapons = ["bazooka", "rockets", "hovermine"];
  //var mods = ["blink", "repulsor", "catmoflage"];
  //var ships = ["Windlord", "Bugger", "Plissken"];

  var equipment = [
    {
      title: "Ship",
      type: "ship",
      options: [
        {name: "Windlord", value: "Windlord", img: "images/stats_windlord.png"},
        {name: "Bugger", value: "Bugger", img: "images/stats_bugger.png"},
        {name: "Plissken", value: "Plissken", img: "images/stats_plissken.png"}
      ]
    },
    {
      title: "Mod",
      type: "mod",
      options: [
        {name: "Blink", value: "blink", img: "images/stats_blink.png"},
        {name: "Repulsor", value: "repulsor", img: "images/stats_repulsor.png"},
        {name: "Catmoflage", value: "catmoflage", img: "images/stats_catmoflage.png"}
      ]
    },
    {
      title: "Weapon",
      type: "weapon",
      options: [
        {name: "Bazooka", value: "bazooka", img: "images/stats_bazooka.png"},
        {name: "Rockets", value: "rockets", img: "images/stats_rockets.png"},
        {name: "Hovermine", value: "hovermine", img: "images/stats_hovermine.png"}
      ]
    }


  ];

  var awl = function (hash) {

  };

  awl.pluginNotFoundError = function () {
    pluginNotFoundModal = $(tmpl('awl-plugin-not-found-template', {}));
    pluginNotFoundModal.modal("show");


    pluginNotFoundModal.on('hidden', function () {
      pluginNotFoundModal.remove();
    });
  };

  awl.autoPlay = function () {
    if (aw.awl.isPluginInstalled()) {
      autoPlayModal = $(tmpl('awl-auto-play-template', {}));
      autoPlayModal.modal("show");

      autoPlayModal.find('.start-auto-play').click(function (e) {
        e.preventDefault();
        autoPlayModal.modal("hide");
        aw.ui.login.dialog(function (user) {
          if (user.error) {


            return;
          }
          aw.ui.awl.equipment("Auto Play", 'Enable', user, function (equipment) {
            if (equipment.error) {
              return;
            }
            aw.awl.enableAutoPlay(user, equipment);
          });
        });

      });

      autoPlayModal.on('hidden', function () {
        autoPlayModal.remove();
      });

    } else {
      this.pluginNotFoundError();
    }
  };

  awl.equipment = function (title, buttonText, user, cb) {

    var callback = function (data) {
      if (cb) {
        cb(data);
        cb = null;
      }
    };

    var favorites = this._getUserFavorites(user);
    $.each(equipment, function (indx, item) {
      var fav = favorites[item.type];
      if (fav == null) {
        return;
      }

      $.each(item.options, function (indx, option) {
        option.fav = (option.value == fav);
      });
    });

    equipmentModal = $(tmpl('awl-equipment-template', {title: title, equipment: equipment, buttonText: buttonText}));
    equipmentModal.modal("show");

    equipmentModal.find('.previous-equipment a, .next-equipment a').click(function (e) {
      e.preventDefault();
      var item = $(this);
      var type = item.data('type');
      var direction = item.data('direction');

      var list = equipmentModal.find('.' + type + "-list").find('li');

      for (var i = 0; i < list.length; i++) {
        var equip = $(list.get(i));
        if (equip.hasClass("selected-equipment")) {
          equip.removeClass("selected-equipment");
          equip.addClass("not-selected-equipment");

          var prevIndx = i - ((direction == "left") ? 1 : - 1);

          if (prevIndx < 0) {
            prevIndx = list.length - 1;
          }

          if (prevIndx > list.length - 1) {
            prevIndx = 0;
          }

          var selected = $(list.get(prevIndx));

          selected.removeClass("not-selected-equipment");
          selected.addClass("selected-equipment");
          break;
        }


      }
    });

    equipmentModal.find('.join').click(function (e) {
      e.preventDefault();
      var item = $(this);


      var selectedEquipment = {};
      equipmentModal.find('.selected-equipment').each(function (indx, equip) {
        equip = $(equip);

        var value = equip.data('value');
        var type = equip.parent().data('type');

        selectedEquipment[type] = value;

      });

      if (window.localStorage) {
        var key;
        for (key in selectedEquipment) {
          localStorage['fav_equipment_' + key] = selectedEquipment[key];
        }
      }


      callback(selectedEquipment);


      equipmentModal.modal('hide');
    });


    equipmentModal.on('hidden', function () {
      equipmentModal.remove();
      callback({error: 'user canceled'});
    });
  };


  awl._getUserFavorites = function (user) {

    if (window.localStorage && localStorage['fav_equipment_ship']) {
      return {
        ship: localStorage['fav_equipment_ship'],
        mod: localStorage['fav_equipment_mod'],
        weapon: localStorage['fav_equipment_weapon']
      };
    }

    var mostUsedMod = "repulsor";
    var mostUsedWeapon = "rockets";
    var mostUsedShip = "Bugger";

    var mostUsedModTime = 0;
    var mostUsedWeaponTime = 0;
    var mostUsedShipTime = 0;

    if (user.equipment) {
      if (user.equipment.ship) {
        var ship;
        for (ship in user.equipment.ship) {
          if (mostUsedShipTime == null || mostUsedShipTime < user.equipment.ship[ship]) {
            mostUsedShipTime = user.equipment.ship[ship];
            mostUsedShip = ship;
          }
        }
      }
      if (user.equipment.device) {
        var device;
        for (device in user.equipment.device) {
          if (mostUsedModTime == null || mostUsedModTime < user.equipment.device[device]) {
            mostUsedModTime = user.equipment.device[device];
            mostUsedMod = device;
          }
        }
      }
      if (user.equipment.weapon2) {
        var weapon;
        for (weapon in user.equipment.weapon2) {
          if (mostUsedWeaponTime == null || mostUsedWeaponTime < user.equipment.weapon2[weapon]) {
            mostUsedWeaponTime = user.equipment.weapon2[weapon];
            mostUsedWeapon = weapon;
          }
        }
      }
    }

    return {mod: mostUsedMod, weapon: mostUsedWeapon, ship: mostUsedShip};
  };

  awl.join = function (server) {
    if (aw.awl.isPluginInstalled()) {
      aw.ui.login.dialog(function (user) {
        if (user.error) {


          return;
        }
        aw.ui.awl.equipment("Joining " + server.name, 'Join', user, function (equipment) {
          if (equipment.error) {
            return;
          }
          aw.stats.api('/server/' + server.id + '/join', {}, function (joinInfo) {
                if (joinInfo.fail) {
                  alert(joinInfo.fail);
                  return;
                }

                var params = {
                  quickstart:"",
                  server_name:server.name,
                  server: joinInfo.server + "," + joinInfo.server2,
                  login_token: user.token,
                  ship: equipment.ship,
                  mod: equipment.mod,
                  weapon: equipment.weapon
                };

                aw.awl.start(params);
              });
        });
      });
    } else {
      awl.pluginNotFoundError();
    }
  };

  if (window.aw == undefined) {
    window.aw = {};
  }

  if (window.aw.ui == undefined) {
    window.aw.ui = {};
  }

  window.aw.ui.awl = awl;


})(window);