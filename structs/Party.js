const crypto = require("crypto")

module.exports = class Party {
    constructor(config, joinInfo, meta) {
        this.id = crypto.randomBytes(16).toString("hex")
        this.createdAt = new Date()
        this.updatedAt = new Date()
        this.revison = 0

        this.config = {
            type: "DEFAULT",
            joinability: "PUBLIC",
            discoverability: "ALL",
            sub_type: "default",
            max_size: 16,
            invite_ttl: 14400,
            join_confirmation: true,
            ...config
        }
        
        this.members = [ 
            {
                account_id : joinInfo.connection.id.split("@")[0],
                meta: {
                    "urn:epic:member:dn_s" : joinInfo.meta["urn:epic:member:dn_s"]
                },
                connections: [ 
                    {
                        id: joinInfo.connection.id,
                        connected_at: new Date(),
                        updated_at: new Date(),
                        yield_leadership: false,
                        meta: joinInfo.connection.meta
                    } 
                ],
                revision: 0,
                updated_at: new Date(),
                joined_at: new Date(),
                role: "CAPTAIN"
            } 
        ]    

        this.meta = meta

        parties.push({
            id: this.id,
            privacy: this.config.joinability,
            members: this.members.map(x => {return x.account_id}),
            party: this
        })

        if (xmppClients.find(x => x.id == joinInfo.connection.id.split("@")[0])) {
            xmppClients.find(x => x.id == joinInfo.connection.id.split("@")[0]).client.sendMessage("xmpp-admin@prod.ol.epicgames.com", JSON.stringify({
                account_dn: joinInfo.meta["urn:epic:member:dn_s"],
                account_id: joinInfo.connection.id.split("@")[0],
                connection: {
                    connected_at: new Date(),
                    id: joinInfo.connection.id.split("@"),
                    meta: joinInfo.connection.meta,
                    updated_at: new Date(),
                    joined_at: new Date()
                },
                member_state_update: {
                    "urn:epic:member:dn_s" : joinInfo.meta["urn:epic:member:dn_s"]
                },
                ns: "Fortnite",
                party_id: this.id,
                revision: this.revison,
                sent: new Date(),
                type: "com.epicgames.social.party.notification.v0.MEMBER_JOINED",
                updated_at: new Date()
            }))
        }
    }

    
    getPartyInfo() {
        return {
            id: this.id,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
            config: this.config,
            members: this.members,
            applicants: [],
            meta: this.meta,
            invites: [],
            revision: this.revision
        }
    }

    updatePartyMeta(updated, deleted) {
        this.meta = {
            ...this.meta,
            ...updated
        }

        deleted.forEach(x => delete this.meta[x])
        this.revision++
    }

    updateUserMeta(id, updated, deleted) {
        if (this.members.find(x => x.id == id)) {
            this.members[this.members.findIndex(x => x.id == id)].meta = {
                ...this.members[this.members.findIndex(x => x.id == id)].meta,
                ...updated
            }
            deleted.forEach(x => delete this.members[this.members.findIndex(x => x.id == id)].meta[x])
            this.members[this.members.findIndex(x => x.id == id)].revision++
        }
    }

    addMember(connection, meta) {
        this.members.push({
            account_id : connection.id.split("@")[0],
            meta: {
                "urn:epic:member:dn_s": connection.meta["urn:epic:member:dn_s"]
            },
            connections: [ 
                {
                    id: connection.id,
                    connected_at: new Date(),
                    updated_at: new Date(),
                    yield_leadership: false,
                    meta: meta
                } 
            ],
            revision: 0,
            updated_at: new Date(),
            joined_at: new Date(),
            role: "MEMBER"
        })
        parties.splice(parties.findIndex(x => x.id == this.id), 1, {
            id: this.id,
            members: this.members.map(x => {return x.account_id}),
            party: this
        })
    }

    removeMember(id) {
        this.members.splice(this.members.findIndex(x => x.id == id), 1)
        parties.splice(parties.findIndex(x => x.id == this.id), 1, {
            id: this.id,
            members: this.members.map(x => {return x.account_id}),
            party: this
        })

        if (this.members.length == 0) this.deleteParty()
    }

    deleteParty() {
        parties.splice(this.findIndex(x => x.id == this.id), 1)
    }
}