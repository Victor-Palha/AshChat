# To do
Well, I have a lot of things to do and to me not get lost, I will write here.
I know, i know, I can use the issues, but I want to do this way and since the repository is mine, I will do it. Deal with it.


- [x] Change the user modal from MongoDB
    - **Why?** Because i need to register the devices that the user is using to garantee that the user is the owner of the device and if he connects from another device, he will need to confirm the access.
    Example: If the user is using the app in his smartphone and he tries to connect from his computer, he will need to confirm the access in his smartphone. This is a security measure.
    - **How?** I will create a new collection in MongoDB called `devices` and when the user logs in, I will check if the device is registered. If not, I will send a notification to the user's email with a link to confirm the access.
    - **When?** I will do this as soon as possible. I'm learning about React Native and i'm thinking about how to do this in the best way
    - **Sub Tasks**
        - [ ] Create the `devices` collection in MongoDB
        - [ ] Create the `Device` model in the backend
        - [ ] Create the `Device` controller in the backend
        - [ ] Create the `Device` service in the backend

- [ ] Create the user's profile
    - **Why?** Well, since i will have change the user modal, why not create the user's profile? I mean, today the user can only change his password, but the app premise is to be a social network, so the user needs to have a profile.

- [ ] Maybe change the way that i do the Auth
    - **Why?** I'm using JWT to authenticate the user, but i'm thinking about using OAuth2 or maybe a way using tokens connected to the user's device. The problem with JWT is that the token is valid until the token expires and if the user logs out, the token is still valid. I need a way to invalidate the token when the user logs out or when the user logs in another device. If i use OAuth2, i can invalidate the token when the user logs out and if i use the token connected to the user's device, i can invalidate the token when the user logs in another device.

- [ ] I need to add some kind of notification system
    - **Why?** I need to notify the user when someone sends a message... Well the app is a bloddy Chat App, so i need to notify the user when someone sends a message.
    - **How?** I was thinking about using Firebase Cloud Messaging, but like i said before, i'm studying React Native and i'm thinking about how to do this in the best way.

- [ ] I need to add this to the issues...
    - Yeah, Yeah, i know... I said that i would not use the issues, but is not like someone is reading this
    . I will add this to the issues, but i will keep this here.
