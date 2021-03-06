# FarmbotJS: Farmbot RPC wrapper

## Browser Support

Works on any browser that supports:

 * [Native Promise objects](http://caniuse.com/#feat=promises).
 * [Websockets](http://caniuse.com/#feat=websockets).
 * JSON (any browser made after 1942).

## Installation

```
npm install farmbot
```

Raise an issue if you require support with other package managers such as Bower. We don't support them currently, but can if there is a need.

## Login with an API Token

Login using your API token from the [Farmbot Web App](http://my.farmbot.io).

[Click here for instructions on how to generate an API token](https://github.com/FarmBot/farmbot-web-app#generating-an-api-token)

Example:

```javascript

import { Farmbot } from "farmbot";

var SUPER_SECRET_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0MTIzQHRlc3QuY29tIiwiaWF0IjoxNDU5MTA5NzI4LCJqdGkiOiI5MjJhNWEwZC0wYjNhLTQ3NjctOTMxOC0xZTQxYWU2MDAzNTIiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAvIiwiZXhwIjoxNDU5NDU1MzI4LCJtcXR0IjoibG9jYWxob3N0IiwiYm90IjoiYWE3YmIzN2YtNWJhMy00NjU0LWIyZTQtNThlZDU3NDY1MDhjIn0.KpkNGR9YH68AF3iHP48GormqXzspBJrDGm23aMFGyL_eRIN8iKzy4gw733SaJgFjmebJOqZkz3cly9P5ZpCKwlaxAyn9RvfjQgFcUK0mywWAAvKp5lHfOFLhBBGICTW1r4HcZBgY1zTzVBw4BqS4zM7Y0BAAsflYRdl4dDRG_236p9ETCj0MSYxFagfLLLq0W63943jSJtNwv_nzfqi3TTi0xASB14k5vYMzUDXrC-Z2iBdgmwAYUZUVTi2HsfzkIkRcTZGE7l-rF6lvYKIiKpYx23x_d7xGjnQb8hqbDmLDRXZJnSBY3zGY7oEURxncGBMUp4F_Yaf3ftg4Ry7CiA";

let bot = new Farmbot({ token: SUPER_SECRET_TOKEN });
bot
  .connect()
  .then(function(bot) {
      return bot.moveRelative({x: 1, y: 2, z: 3, speed: 100});
  });

```

# Publishing

0. `webpack`
0. `npm publish`

# Sending Commands to a Farmbot Object

```javascript

bot
  .connect()
  .then(function(bot){
    alert("Bot online!");
    bot.emergencyStop(); // You can chain commands.
  })
  .then(function(bot){
    alert("Bot has stopped!");
  })
  .catch(function(error) {
    alert("Something went wrong :(");
  });

```

## Basic RPC Commands

Call RPC commands using the corresponding method on `bot`. All RPC commands return a promise. Timeout is set at `1000 ms` by default and can be reconfigured by changing the bot `timeout` propery on instantiation or via `bot.setState("timeout", 999)`.

Example:

```javascript

  bot
    .homeX()
    .then(function(ack){
      console.log("X Axis is now at 0.");
    })
    .catch(function(err){
      console.log("Failed to bring X axis home.");
    })

```

Currently supported commands:

 * emergencyStop
 * execSequence
 * homeAll
 * homeX
 * homeY
 * homeZ
 * moveAbsolute({x:, y:, z:})
 * moveRelative({x:, y:, z:})
 * pinWrite(num, val, mode)
 * readStatus
 * send(commandObject)
 * syncSequence
 * updateMcu
 * send(messageObject)
 * calibrate("x"|"y"|"z")
## Using Events

```
  var bot = Farmbot({uuid: '---', token: '---'});
  bot.on("eventName", function(data, eventName) {
    console.log("I just got an" + eventName + " event!");
    console.log("This is the payload: " + data);
  })
   // "I just got an eventName event!"
   // "This is the payload: any javascript object or primitive"
  bot.emit("eventName", "any javascript object or primitive");
  var eventHandlers = bot.event("eventName");
   // [function(){...}]
```

## Common Events

 * `*`: Catch all events (for debugging).
 * `ready`: Client is connected and subscribed to bot.
 * `disconnect`: Connection lost. **Note: FarmbotJS won't auto-reconnect**.
 * `message`: When the bot gets a *non-rpc* command, it is regarded as a 'message'. Deprecated.
 * `change`: The bot object's internal state has changed.
 * `notification`: The bot is sending you an "unsolicited" notification, such as a log notification or a status update.
 * `<random uuid>`: RPC commands have UUIDs when they leave the browser. When the bot responds to that message, FarmbotJS will emit an event named after the request's UUID. Mostly for internal use.

## Internal State and Config

The bot object keeps all state in one place for sanity. This includes things like configuration options, current position, etc. All updates to the bot's state are broadcast with a `change` event, that reports current and previous state value as it changes.

 * `bot.getState()`: Get copy of Farmbot status variables (read only).
 * `bot.setState(name, value)`: Set state value 'x' to 'y'. Ex: `bot.setState('uuid', '---')`. Emits a `change` event.

## TODO

 - [ ] Convert hardcoded strings, "magic numbers" and event names to constants.
 - [ ] Get compliant with A+ promise spec.
 - [ ] Start using `@types/promise` instead of re-writing custom interfaces.
 - [ ] Track state changes when bot returns a status object.
        - define an `isStatusUpdate` type guard.
        - Add `maybeUpdateState` method.
          - emit `change` event in there.
          - Call it inside of `send()`.
