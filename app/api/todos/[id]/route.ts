import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(req: NextRequest, 
    {params}: {params: {id: string}}
) {
    
    const { userId } = await auth();
    
    if (!userId) {
        return NextResponse.json({error: "Unauthorised"}, {status: 401})
    };

    try {
        const todoId = params.id;

        const todo = await prisma.todo.findUnique({
            where: {id: todoId}
        });

        if (!todo) {
            return NextResponse.json({error: "Todo Not found"}, {status: 401})
        };

        if (todo.userId !== userId) {
            return NextResponse.json({error: "Forbidden"}, {status: 403})
        };

        await prisma.todo.delete({
            where: {id: todoId}
        });

        return NextResponse.json({error: "Todo Deleted successfully"}, {status: 401})
    } catch (error) {
        
    }

}