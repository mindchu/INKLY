import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/side_bar'
import Home_Top_bar from './components/home/home_top_bar'
import Home_page from './components/home/home_page'
import Signin from './signin'
import Discussion_page from './components/discussion/discussion_page'
import Discussion_top_bar from './components/discussion/discussion_top_bar'
import NoteForum_page from './components/note_forum/note_forum_page'
import NoteForum_top_bar from './components/note_forum/note_forum_top_bar'
import Search_page from './components/search/search_page/'
import Search_top_bar from './components/search/search_top_bar'
import Following_page from './components/following/following_page'
import Following_top_bar from './components/following/following_top_bar'
import MyNotes_page from './components/my_notes/my_notes_page'
import Mynotes_top_bar from './components/my_notes/my_notes_top_bar'
import CreateNote_page from './components/create_note/create_note_page'
import CreateNote_top_bar from './components/create_note/create_note_top_bar'
import Bookmarks_wrapper from './components/bookmarks/bookmarks_wrapper'
import Profile_page from './components/profile/profile_page'
import Profile_top_bar from './components/profile/profile_top_bar'
import Edit_profile_page from './components/edit_profile/edit_profile_page'
import { BookmarksProvider } from './context/BookmarksContext'
import { SortProvider } from './context/SortContext'
import { MyNotesProvider } from './context/MyNotesContext'
import { ProfileProvider } from './context/ProfileContext'

const App = () => {
  return (
    <ProfileProvider>
      <BookmarksProvider>
        <SortProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                  <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex flex-col flex-1 min-h-0">
                      <div className="shrink-0">
                        <Home_Top_bar />
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto">
                        <Home_page />
                      </div>
                    </div>
                  </div>
                } />
              <Route path="/signin" element={<Signin />} />
              <Route
                path="/home"
                element={
                  <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex flex-col flex-1 min-h-0">
                      <div className="shrink-0">
                        <Home_Top_bar />
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto">
                        <Home_page />
                      </div>
                    </div>
                  </div>
                }
              />
              <Route
                path="/discussion"
                element={
                  <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex flex-col flex-1 min-h-0">
                      <div className="shrink-0">
                        <Discussion_top_bar />
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto">
                        <Discussion_page />
                      </div>
                    </div>
                  </div>
                }
              />
              <Route
                path="/note_forum"
                element={
                  <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex flex-col flex-1 min-h-0">
                      <div className="shrink-0">
                        <NoteForum_top_bar />
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto">
                        <NoteForum_page />
                      </div>
                    </div>
                  </div>
                }
              />
              <Route
                path="/search"
                element={
                  <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex flex-col flex-1 min-h-0">
                      <div className="shrink-0">
                        <Search_top_bar />
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto">
                        <Search_page />
                      </div>
                    </div>
                  </div>
                }
              />
              <Route
                path="/following"
                element={
                  <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex flex-col flex-1 min-h-0">
                      <div className="shrink-0">
                        <Following_top_bar />
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto">
                        <Following_page />
                      </div>
                    </div>
                  </div>
                }
              />
              <Route
                path="/my_notes"
                element={
                  <MyNotesProvider>
                    <div className="flex h-screen overflow-hidden">
                      <Sidebar />
                      <div className="flex flex-col flex-1 min-h-0">
                        <div className="shrink-0">
                          <Mynotes_top_bar />
                        </div>
                        <div className="flex-1 min-h-0 overflow-y-auto">
                          <MyNotes_page />
                        </div>
                      </div>
                    </div>
                  </MyNotesProvider>
                }
              />
              <Route
                path="/create_note"
                element={
                  <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex flex-col flex-1 min-h-0">
                      <div className="shrink-0">
                        <CreateNote_top_bar />
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto">
                        <CreateNote_page />
                      </div>
                    </div>
                  </div>
                }
              />
              <Route
                path="/bookmarks"
                element={
                  <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex flex-col flex-1 min-h-0">
                      <Bookmarks_wrapper />
                    </div>
                  </div>
                }
              />
              <Route
                path="/profile"
                element={
                  <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex flex-col flex-1 min-h-0">
                      <div className="shrink-0">
                        <Profile_top_bar />
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto">
                        <Profile_page />
                      </div>
                    </div>
                  </div>
                }
              />
              <Route
                path="/edit_profile"
                element={
                  <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex flex-col flex-1 min-h-0">
                      <div className="shrink-0">
                        <Profile_top_bar />
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto">
                        <Edit_profile_page />
                      </div>
                    </div>
                  </div>
                }
              />

            </Routes>
          </BrowserRouter>
        </SortProvider>
      </BookmarksProvider>
    </ProfileProvider>
  )
}

export default App