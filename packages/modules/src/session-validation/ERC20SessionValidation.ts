
export interface ISessionPermissions {
    sessionPubKey: string
}

export class ERC20SessionValidationModule implements ISessionValidationModule<ERC20Permissions> {

    // moduleAddress:string

    getSessionKeyData(permissions: ERC20Permissions): Promise<string> {
        console.log(permissions.sessionPubKey)
        console.log(permissions.erc20Address)
        console.log(permissions.receiver)
        console.log(permissions.maxAmount)
        throw new Error("Method not implemented.");
    }

    getModuleAddress(): string {
        throw new Error("Method not implemented.");
    }

}