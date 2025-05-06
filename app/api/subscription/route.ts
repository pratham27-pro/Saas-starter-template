import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function POST(req: Response) {
    const { userId } = await auth();
    
    if (!userId) {
        return NextResponse.json({error: "Unauthorised"}, {status: 401})
    }

    // payment logic here of razorpay or stripe etc

    try {
        const user = await prisma.user.findUnique({where: {id: userId}});

        if (!user) {
            return NextResponse.json({ error: "User not found!!" }, { status: 401 });
        };

        const subscriptionEnds = new Date();
        subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);

        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: {
                isSubscribed: true,
                subscriptionEnds: subscriptionEnds
            }
        });

        return NextResponse.json({
            message: "Subscription successfully",
            subscriptionEnds: updatedUser.subscriptionEnds
        })

    } catch (err) {
        console.log("Error updating subscription", err);
        return NextResponse.json(
            {error: "Internal Server error"},
            {status: 500}
        )
    }
}

export async function GET(req: Response) {
    const { userId } = await auth();
    
    if (!userId) {
        return NextResponse.json({error: "Unauthorised"}, {status: 401})
    };

    try {
        const user = await prisma.user.findUnique(
            {
                where: {id: userId},
                select: {
                    isSubscribed: true,
                    subscriptionEnds: true
                }
            }
        );

        if (!user) {
            return NextResponse.json({ error: "User not found!!" }, { status: 401 });
        };

        const now = new Date();
        if (user.subscriptionEnds && user.subscriptionEnds < now) {
            await prisma.user.update({
                where: {id: userId},
                data: {
                    isSubscribed: false,
                    subscriptionEnds: null
                }
            });

            return NextResponse.json({
                isSubscribed: false,
                subscriptionEnds: null
            })
        };

        return NextResponse.json({
            isSubscribed: user.isSubscribed,
            subscriptionEnds: user.subscriptionEnds
        })

    } catch (error) {
        
    }
}