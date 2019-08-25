# EveWho

EveWho allows you to view the members of Eve Online corporations and alliances, a resource that is not available within the game. Simply view a corporation or alliance to see current members.

### API

EveWho does provide a very basic API, here are some examples:

    https://evewho.com/api/character/1633218082
    https://evewho.com/api/corplist/98330748
    https://evewho.com/api/allilist/99006319

The API is CORS enabled. If you're looking for more detailed information about entities please utilize Eve Online's ESI.

## FAQ

**What does Delta mean?**

Delta is simply the difference in the number of pilots from 7 days ago. If 7 days ago a corp had 13 pilots, and today that corp has 18 pilots, then that corp would have a delta of 5.

**How did you get all this data? Are you scraping the API?**

No scraping happening and everything is happening within CCP's Terms of Service. For an explanation I'll link my post on the EVEO forums here. The official forum announcement can be found here.

**How do you determine the activity of a corporation?**

By the number of new recruits in the last 90 days. The more recruits you have, the more likely it is that you're still active. Granted this system is far from perfect and doesn't take into account kills, losses, or corps that just don't recruit, however, the majority of active corporations do recruit at least one member every 90 days. Corporations that recruit fresh blood tend to be more active, of course, that's just my opinion!

**How do you determine the ranking for Pirate and Carebear Corporations?**

The security status of every pilot in the corporation is averaged and then multiplied by the log of the number of pilots of the corporation.

    corp_security_level = avg(sec_status) * log(memberCount)
    
**I don't like my pilot/corporation/alliance being listed on your website, remove it now!**

All information available on this website is owned by CCP. If you'd like to see a name removed, please contact CCP at https://www.ccpgames.com/contact-us/ and fill out the request. If/when CCP changes the name within the game the game's API will reflect this change shortly after, once this happens the websites will pick up the name change and apply the name change to the website's database. 

**I'm using a tool to gather data from EveWho, why do I keep getting blocked?**

To help prevent folks from scraping EveWho and causing high loads a policy is in place that allows 10 requests within a 30 second time period. Anything more than this and you'll be shown an error page and forced to wait. We don't mind folks seeking more information, which is why an API is available.
