import React, { useState } from 'react'
import Bookmarks_top_bar from './bookmarks_top_bar'
import Bookmarks_page_content from './bookmarks_page_content'

const Bookmarks_wrapper = () => {
    const [sortBy, setSortBy] = useState('most_recent');

    return (
        <>
            <div className="shrink-0">
                <Bookmarks_top_bar sortBy={sortBy} setSortBy={setSortBy} />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <Bookmarks_page_content sortBy={sortBy} />
            </div>
        </>
    )
}

export default Bookmarks_wrapper