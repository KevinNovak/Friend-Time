---
description: Manage bot settings.
---

# bot

## Summary

The `/bot` command is used to view and change [bot settings](../../settings/bot-settings/). These settings apply to just the server you are using Friend Time in.

* `/bot` - View all bots with settings in the server.
* `/bot <@bot>` - View a bot's settings.
* `/bot <@bot> <setting>` - Change one of a bot's settings.
* `/bot <@bot> <setting> remove` - Reset a setting to default.
* `/bot <@bot> remove` Remove all of a bot's data.

{% hint style="info" %}
To setup a **new bot**, use the [set](../user-commands/set.md#setup-for-a-bot) command.
{% endhint %}

## View All Bots with Settings in the Server

Type `/bot` to view all bots with settings in the server.

![](../../.gitbook/assets/image%20%2844%29.png)

## View a Bot's Settings

Type `/bot <@bot>` to view a bot's settings.

![](../../.gitbook/assets/image%20%2843%29.png)

{% hint style="info" %}
If a setting is _italicized_ it means the bot is using the default setting value.
{% endhint %}

## Change One of a Bot's Settings

Type `/bot <@bot> <setting>` to change one of a bot's settings.

![](../../.gitbook/assets/image%20%2847%29.png)

## Reset a Setting to Default

Type `/bot <@bot> remove` to reset a setting to default.

![](../../.gitbook/assets/image%20%2848%29.png)

## Remove All of a Bot's Data

Type `/bot <@bot> remove` to remove all of a bot's data.

![](../../.gitbook/assets/image%20%2849%29.png)

{% hint style="info" %}
This will remove the bot from the server's [bot list](bot.md#view-all-bots-with-settings-in-the-server).
{% endhint %}

