const Athena = require(`${__dirname}/../model/Athena`)
const CommonCore = require(`${__dirname}/../model/CommonCore`)
const caching = require(`${__dirname}/caching`)

module.exports = {
    async commoncore(id) {
        var commoncore = await CommonCore.findOne({id: id})

        return {
            changeType: "fullProfileUpdate",
            profile: {
                _id: id,
                created: commoncore.createdAt,
                updated: new Date(),
                rvn: 1,
                wipeNumber: 1,
                id: id,
                profileId: "common_core",
                version: "fdev_release_may_2020",
                items: {
                    "Currency:MtxPurchased": {
                        attributes: {
                            platform: commoncore.mtxplatform
                        },
                        quantity: commoncore.vbucks,
                        templateId: "Currency:MtxPurchased"
                    },
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
    },

    async athena(id) {
        var athena = await Athena.findOne({id: id})

        var final = {
            changeType: "fullProfileUpdate",
            profile: {
                _id: id,
                created: new Date(),
                updated: new Date(),
                rvn: 1,
                wipeNumber: 1,
                id: id,
                profileId: "athena",
                version: "fdev_release_may_2020",
                items: {                    
                    "CosmeticLocker:cosmeticlocker_athena1": {
                        templateId: "CosmeticLocker:cosmeticlocker_athena",
                        attributes: {
                            locker_slots_data: {
                                slots: {
                                    Glider: {
                                        items: [
                                            athena.glider
                                        ]
                                    },
                                    Dance: {
                                        items: athena.dance,
                                        activeVariants: [
                                            null,
                                            null,
                                            null,
                                            null,
                                            null,
                                            null
                                        ]
                                    },
                                    SkyDiveContrail: {
                                        items: [
                                            athena.skydivecontrail
                                        ]
                                    },
                                    LoadingScreen: {
                                        items: [
                                            athena.loadinscreen
                                        ]
                                    },
                                    Pickaxe: {
                                        items: [
                                            athena.pickaxe
                                        ]
                                    },
                                    ItemWrap: {
                                        items: athena.itemwrap
                                    },
                                    MusicPack: {
                                        items: [
                                            athena.musicpack
                                        ]
                                    },
                                    Character: {
                                        items: [
                                            athena.character
                                        ],
                                        activeVariants: [
                                            null
                                        ]
                                    },
                                    Backpack: {
                                        items: [
                                            athena.backpack
                                        ],
                                        activeVariants: [
                                            null
                                        ]
                                    }
                                }
                            },
                            use_count: 0,
                            banner_icon_template: "OtherBanner28",
                            banner_color_template: "defaultcolor0",
                            locker_name: "FDev",
                            item_seen: false,
                            favorite: false
                        },
                        "quantity": 1
                    },
                    "CosmeticLocker:cosmeticlocker_athena2": {
                        templateId: "CosmeticLocker:cosmeticlocker_athena",
                        attributes: {
                            locker_slots_data: {
                                slots: {
                                    Glider: {
                                        items: [
                                            athena.glider
                                        ]
                                    },
                                    Dance: {
                                        items: athena.dance,
                                        activeVariants: [
                                            null,
                                            null,
                                            null,
                                            null,
                                            null,
                                            null
                                        ]
                                    },
                                    SkyDiveContrail: {
                                        items: [
                                            athena.skydivecontrail
                                        ]
                                    },
                                    LoadingScreen: {
                                        items: [
                                            athena.loadinscreen
                                        ]
                                    },
                                    Pickaxe: {
                                        items: [
                                            athena.pickaxe
                                        ]
                                    },
                                    ItemWrap: {
                                        items: athena.itemwrap
                                    },
                                    MusicPack: {
                                        items: [
                                            athena.musicpack
                                        ]
                                    },
                                    Character: {
                                        items: [
                                            athena.character
                                        ],
                                        activeVariants: [
                                            null
                                        ]
                                    },
                                    Backpack: {
                                        items: [
                                            athena.backpack
                                        ],
                                        activeVariants: [
                                            null
                                        ]
                                    }
                                }
                            },
                            use_count: 0,
                            banner_icon_template: "OtherBanner28",
                            banner_color_template: "defaultcolor0",
                            locker_name: "FDev",
                            item_seen: false,
                            favorite: false
                        },
                        "quantity": 1
                    },
                },
                stats:  {
                    attributes: {
                        past_seasons: [],
                        season_match_boost: 0,
                        loadouts: [
                            "CosmeticLocker:cosmeticlocker_athena1",
                            "CosmeticLocker:cosmeticlocker_athena2"
                        ],
                        mfa_reward_claimed: true,
                        rested_xp_overflow: 0,
                        quest_manager: {
                            dailyLoginInterval: new Date(),
                            dailyQuestRerolls: 1
                        },
                        book_level: athena.level,
                        season_num: 12,
                        season_update: 0,
                        book_xp: 99999999,
                        permissions: [],
                        season: {
                            numWins: 999,
                            numHighBracket: 999,
                            numLowBracket: 999
                        },
                        vote_data: {},
                        lifetime_wins: 0,
                        book_purchased: true,
                        purchased_battle_pass_tier_offers: {},
                        rested_xp_exchange: 1.0,
                        level: athena.level,
                        xp_overflow: 0,
                        rested_xp: 0,
                        rested_xp_mult: 1,
                        accountLevel: athena.level,
                        competitive_identity: {},
                        inventory_limit_bonus: 0,
                        last_applied_loadout: "CosmeticLocker:cosmeticlocker_athena1",
                        daily_rewards: {},
                        xp: 99999999,
                        season_friend_match_boost: 0,
                        active_loadout_index: 0
                    }
                },
            }
        }

        caching.getCosmetics().forEach(cosmetic => {
            final.profile.items[`${cosmetic.backendType}:${cosmetic.id}`] = {
                templateId: `${cosmetic.backendType}:${cosmetic.id}`,
                attributes: {
                    max_level_bonus: 0,
                    level: 1,
                    item_seen: 1,
                    xp: 0,
                    variants: [],
                    favorite: false
                },
                quantity: 1
            }
        })

        return final
    }
}