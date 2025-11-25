import { AuthService } from "@/services/auth.service";
import { ApiRequest } from "@/utils/apiRequest";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { validationMessages } from "@/i18n/validationMessages";
import { UserService } from "@/services/user.service";
import jwt, { SignOptions } from "jsonwebtoken";
import { ENV } from "@/config/env";



export class AuthController extends BaseController {
    private userService: UserService;
    private authService: AuthService;

    constructor(
        authService: AuthService,
        userService: UserService
    ) {
        super()
        this.userService = userService;
        this.authService = authService;
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        this.handleRequest(req, res, next, async () => {
            const lang = ApiRequest.getCurrentLang(req);
            const { username, password, rememberMe } = req.body
            const auth = await this.authService.getAuthByUsername(username);
            if (!auth || !auth.password) {
                throw new AppError(lang === 'vi' ? 'Sai tài khoản' : 'Incorrect username', 401, ErrorCode.INCORRECT_CREDENTIALS)
            }
            const user = await this.userService.getUserById(auth.userId);
            if (!user) {
                throw new AppError(validationMessages[lang].userNotFound || 'User not found', 401, ErrorCode.USER_NOT_FOUND)
            }
            if (!user.isActive) {
                throw new AppError(validationMessages[lang].userNotActive || 'User not active', 401, ErrorCode.INVALID_TOKEN)
            }
            const isPasswordValid = await bcrypt.compare(password, auth.password);
            if (!isPasswordValid) {
                throw new AppError(lang === 'vi' ? 'Sai mật khẩu' : 'Incorrect password', 401, ErrorCode.INCORRECT_CREDENTIALS)
            }
            const accessToken = this.generateAccessToken({
                user: user,
                roleId: auth.roleId,
            }, 15 * 1000 * 60);
            const refreshToken = this.generateRefreshToken({
                userId: user.id,
            }, 15 * 1000 * 60 * 24);

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 30 * 60 * 1000
            })
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 60 * 60 * 1000 * 24,
            })
            return auth
        })
    }

    signup = async (req: Request, res: Response, next: NextFunction) => {
        this.handleRequest(req, res, next, async () => {
            const lang = ApiRequest.getCurrentLang(req)
            const { username, password, confirmPassword, email, firstName, lastName, phone, image } = req.body;
            if (password !== confirmPassword) {
                throw new AppError(validationMessages[lang].passwordMismatch || 'Passwords do not match', 400, ErrorCode.PASSWORD_MISMATCH)
            }
            const userExists = await this.authService.getAuthByUsername(username);
            if (userExists) {
                throw new AppError(validationMessages[lang].usernameExist || 'Username already exists', 400, ErrorCode.USERNAME_EXISTS)
            }
            const emailExists = await this.userService.getUserByEmail(email);
            if (emailExists) {
                throw new AppError(validationMessages[lang].emailExist || 'Email already exists', 400, ErrorCode.EMAIL_EXISTS)
            }
            const user = await this.userService.createUser({
                firstName,
                lastName,
                phone,
                email,
                image,
                isActive: true,
                isDeleted: false,
                createAt: new Date(),
                updatedAt: new Date(),
            });
            if (!user) {
                throw new AppError(validationMessages[lang].error || 'User create failed', 500, ErrorCode.DB_ERROR)
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const userAuth = await this.authService.createAuth({
                username,
                password: hashedPassword,
                user: {
                    connect: {
                        id: user.id
                    }
                },
                role: {
                    connect: {
                        id: '618f6c4e-5acb-4b0c-9c96-357374d92812'
                    }
                },
                passwordHistories: {
                    create: {
                        password: hashedPassword,
                        createAt: new Date(),
                    }
                }
            });
            if (!userAuth) {
                throw new AppError(validationMessages[lang].error || 'User auth create failed', 500, ErrorCode.DB_ERROR)
            }
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.firstName + ' ' + user.lastName,
                    role: userAuth.roleId
                },
            }
        })
    }

    logout = async (req: Request, res: Response, next: NextFunction) => {
        this.handleRequest(req, res, next, async () => {
            res.cookie('accessToken', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                expires: new Date(0),
                path: '/'
            });

            if (req.cookies && req.cookies.refreshToken) {
                res.cookie('refreshToken', '', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    expires: new Date(0),
                    path: '/'
                });
            }
            return { success: true, message: 'Đăng xuất thành công' };
        })
    }

    private generateAccessToken(
        payload: object,
        expiresTime: number
    ): string {
        const secret = ENV.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined");
        }
        const options: SignOptions = {
            algorithm: 'HS256',
            expiresIn: expiresTime,
        };
        return jwt.sign(payload, secret, options);
    }

    private generateRefreshToken(
        payload: object,
        expiresTime: number
    ): string {
        const secret = ENV.REFRESH_TOKEN_SECRET;
        if (!secret) {
            throw new Error("REFRESH_TOKEN_SECRET is not defined");
        }
        const options: SignOptions = {
            algorithm: 'HS256',
            expiresIn: expiresTime,
        };
        return jwt.sign(payload, secret, options);
    }





}