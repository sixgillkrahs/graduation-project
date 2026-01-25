namespace IUserService {
  export interface UsersDTO {
    username: string
    userId: UserId
    roleId: RoleId
    id: string
    createdAt: Date
  }

  export interface UserDTO {
    _id: string
    password: string
    username: string
    userId: UserId
    passwordHistories: PasswordHistory[]
    roleId: RoleId
    passkeys: any[]
    createdAt: string
    updatedAt: string
  }

  export interface UserId {
    email: string
    fullName: string
    phone: string
    isActive: boolean
    id: string
  }

  export interface RoleId {
    name: string
    code: string
    id: string
  }
  export interface PasswordHistory {
    password: string
    createdAt: string
    _id: string
  }

}
