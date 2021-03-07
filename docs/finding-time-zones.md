---
description: How to find time zones.
---

# Finding Time Zones

## Using the Time Zone Map

One way to find time zones is by using the [Time Zone Map](https://kevinnovak.github.io/Time-Zone-Picker/):

![](.gitbook/assets/image%20%2838%29.png)

{% hint style="info" %}
You can also get to this map by using the [map](commands/user-commands/map.md) command in Discord.
{% endhint %}

Once you are on the map page, you will see 3 different time zones listed:

1. **Auto-Detected Time Zone**
   * The time zone that the map has auto-detected from your location.
2. **Selected Time Zone**
   * The time zone that you currently have selected.
   * Click any location on the map to see the time zone name!
3. **Hovered Time Zone**
   * If you are on PC, this will be the name of the time zone you are hovering over with your mouse.

You can click the "**Copy**" button to copy the **selected time zone**, and paste this where Friend Time needs a time zone:

![](.gitbook/assets/image%20%2839%29.png)

## Time Zone Name Format

Friend Time uses a special format for time zone names \(more specifically the [IANA Time Zone Database](https://www.iana.org/time-zones), an international standard for time zones\).

Time zone names are in a "Region/City" format, for example:

* America/New\_York
* Europe/London
* Asia/Manila
* Australia/Sydney

{% hint style="warning" %}
Please note that **most cities** are **NOT** part of a time zone name. There are only a small amount of \(usually very populated\) cities which [IANA](https://www.iana.org/) \(an international group\) have decided are part of time zone names.
{% endhint %}

{% hint style="danger" %}
Time zone **abbreviations** like "EST" or "GMT" are also **NOT** accepted by Friend Time because they are often ambiguous. For example "CST" could mean "China Standard Time", "Cuba Standard Time", or "Central Standard Time".
{% endhint %}

