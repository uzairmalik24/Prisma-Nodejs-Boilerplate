import prisma from "../prisma.js";


export const paginate = async ({
    model,
    where = {},
    include = undefined,
    select = undefined,
    orderBy = { id: 'desc' },
    page,
    limit = 10,
    cursor,
    cursorField = 'id',
    includeTotalCount = true
}) => {
    if (!prisma[model]) {
        throw new Error(`Model '${model}' does not exist in Prisma schema`);
    }

    const parsedLimit = parseInt(limit) || 10;

    if (cursor) {
        const cursorObj = { [cursorField]: cursor };

        const [data, totalCount] = await Promise.all([
            prisma[model].findMany({
                where,
                include,
                select,
                orderBy,
                take: parsedLimit + 1, 
                cursor: cursorObj,
                skip: 1
            }),
            includeTotalCount ? prisma[model].count({ where }) : Promise.resolve(null)
        ]);

        const hasMore = data.length > parsedLimit;
        const items = hasMore ? data.slice(0, parsedLimit) : data;
        const nextCursor = hasMore ? items[items.length - 1][cursorField] : null;

        return {
            data: items,
            pagination: {
                type: 'cursor',
                limit: parsedLimit,
                cursor,
                nextCursor,
                hasMore,
                ...(includeTotalCount && { total: totalCount })
            }
        };
    }

    const parsedPage = parseInt(page) || 1;
    const skip = (parsedPage - 1) * parsedLimit;

    const [data, totalCount] = await Promise.all([
        prisma[model].findMany({
            where,
            include,
            select,
            orderBy,
            skip,
            take: parsedLimit
        }),
        includeTotalCount ? prisma[model].count({ where }) : Promise.resolve(null)
    ]);

    const totalPages = includeTotalCount ? Math.ceil(totalCount / parsedLimit) : null;

    return {
        data,
        pagination: {
            type: 'offset',
            page: parsedPage,
            limit: parsedLimit,
            ...(includeTotalCount && {
                total: totalCount,
                totalPages,
                hasNextPage: parsedPage < totalPages,
                hasPreviousPage: parsedPage > 1
            })
        }
    };
};


export const buildSearchWhere = (searchFields, searchTerm, additionalWhere = {}) => {
    if (!searchTerm || searchFields.length === 0) {
        return additionalWhere;
    }

    return {
        AND: [
            {
                OR: searchFields.map(field => ({
                    [field]: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                }))
            },
            additionalWhere
        ]
    };
};


export const getPaginationParams = (query) => {
    return {
        page: query.page,
        limit: query.limit,
        cursor: query.cursor,
        cursorField: query.cursorField || 'id'
    };
};