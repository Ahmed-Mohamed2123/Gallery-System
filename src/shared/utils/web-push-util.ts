import * as webPush from "web-push";
import {CONFIG} from "../../config/config";
import {ISubscriptionDetail} from "../interfaces/subscription-detail.interface";
import {INotificationData} from "../interfaces/notification-data.interface";

export class WebPushUtil {
    static configureWebPush() {
        webPush.setVapidDetails(
            "mailto:you@domain.com",
            CONFIG.VAPID_KEYS.PUBLIC_KEY,
            CONFIG.VAPID_KEYS.PRIVATE_KEY
        );
    }

    static async sendWebPushNotification(subscriptionDetails: ISubscriptionDetail, notificationPayload: INotificationData) {
        return webPush.sendNotification(subscriptionDetails, JSON.stringify(notificationPayload));
    }
}