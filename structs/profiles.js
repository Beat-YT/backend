const Athena = require(`${__dirname}/../../model/Athena`)
const CommonCore = require(`${__dirname}/../../model/CommonCore`)

module.exports = {
    async commoncore(id) {
        var commoncore = CommonCore.findOne({id: id})

        return {
            changeType: "fullProfileUpdate",
            profile: {
                _id: accountId,
                created: commoncore.createdAt,
                updated: new Date(),
                rvn: 1,
                wipeNumber: 1,
                accountId: id,
                profileId: "common_core",
                version: "fdev_release_may_2020",
                items: {
                    "Currency:MtxPurchased": {
                        attributes: {
                            platform: commoncore.mtxplatform
                        },
                        quantity: a,
                        templateId: "Currency:MtxPurchased"
                    }
                },
                stats: {
                    survey_data: {
                        allSurveysMetadata: {},
                        metadata: {}
                    },
                    personal_offers: {},
                    intro_game_played: true,
                    mtx_purchase_history: {
                        refundsUsed: 0,
                        refundCredits: 69,
                        purchases: []
                    },
                    undo_cooldowns: [],
                    import_friends_claimed: {},
                    mtx_affiliate_set_time: new Date(),
                    inventory_limit_bonus: 0,
                    current_mtx_platform: "EpicPC",
                    mtx_affiliate: "",
                    weekly_purchases: {},
                    daily_purchases: {},
                    ban_history: {},
                    in_app_purchases: {
                        receipts: [],
                        ignoredReceipts: [],
                        fulfillmentCounts: {}
                    },
                    undo_timeout: new Date(),
                    permissions: [],
                    monthly_purchases: {
                        lastInterval: new Date(),
                        purchaseList: {}
                    },
                    allowed_to_send_gifts: true,
                    mfa_enabled: true,
                    allowed_to_receive_gifts: true,
                    gift_history: {
                        num_sent: 0,
                        sentTo: {},
                        num_received: 0,
                        receivedFrom: {},
                        gifts: []
                    }
                }
            }
        }
    }
}