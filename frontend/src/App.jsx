import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminMockChip from './components/common/AdminMockChip'
import ProtectedRoute from './components/common/ProtectedRoute'
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
import My_discussions_page from './components/my_discussions/My_discussions_page'
import My_discussions_top_bar from './components/my_discussions/My_discussions_top_bar'
import CreateNote_page from './components/create_note/create_note_page'
import CreateNote_top_bar from './components/create_note/create_note_top_bar'
import CreateDiscussion_page from './components/create_discussion/Create_discussion_page'
import CreateDiscussion_top_bar from './components/create_discussion/Create_discussion_top_bar'
import Bookmarks_wrapper from './components/bookmarks/bookmarks_wrapper'
import Profile_page from './components/profile/profile_page'
import Profile_top_bar from './components/profile/profile_top_bar'
import Edit_profile_page from './components/edit_profile/edit_profile_page'
import ContentDetailPage from './components/content_detail/ContentDetailPage'
import Interests_page from './components/profile/interests_page'
import { BookmarksProvider } from './context/BookmarksContext'
import { SortProvider } from './context/SortContext'
import { MyNotesProvider } from './context/MyNotesContext'
import { ProfileProvider } from './context/ProfileContext'
import { SearchProvider } from './context/SearchContext'
import { SidebarProvider } from './context/SidebarContext'
import EditContentPage from './components/edit_content/EditContentPage'
import EditContentTopBar from './components/edit_content/EditContentTopBar'
import AdminTerminalPage from './components/admin/AdminTerminalPage'
import AdminTerminalTopBar from './components/admin/AdminTerminalTopBar'
import CommentThreadPage from './components/content_detail/CommentThreadPage'

const App = () => {
  return (
    <ProfileProvider>
      <SidebarProvider>
        <SearchProvider>
          <BookmarksProvider>
            <AdminMockChip />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <SortProvider>
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
                    </SortProvider>
                  </ProtectedRoute>
                } />
                <Route path="/signin" element={<Signin />} />
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <SortProvider>
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
                      </SortProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/discussion"
                  element={
                    <ProtectedRoute>
                      <SortProvider contentType="discussion">
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
                      </SortProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/note_forum"
                  element={
                    <ProtectedRoute>
                      <SortProvider contentType="post">
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
                      </SortProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute>
                      <SortProvider>
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
                      </SortProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/following"
                  element={
                    <ProtectedRoute>
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
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my_notes"
                  element={
                    <ProtectedRoute>
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
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my_discussions"
                  element={
                    <ProtectedRoute>
                      <MyNotesProvider>
                        <div className="flex h-screen overflow-hidden">
                          <Sidebar />
                          <div className="flex flex-col flex-1 min-h-0">
                            <div className="shrink-0">
                              <My_discussions_top_bar />
                            </div>
                            <div className="flex-1 min-h-0 overflow-y-auto">
                              <My_discussions_page />
                            </div>
                          </div>
                        </div>
                      </MyNotesProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create_note"
                  element={
                    <ProtectedRoute>
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
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create_discussion"
                  element={
                    <ProtectedRoute>
                      <div className="flex h-screen overflow-hidden">
                        <Sidebar />
                        <div className="flex flex-col flex-1 min-h-0">
                          <div className="shrink-0">
                            <CreateDiscussion_top_bar />
                          </div>
                          <div className="flex-1 min-h-0 overflow-y-auto">
                            <CreateDiscussion_page />
                          </div>
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookmarks"
                  element={
                    <ProtectedRoute>
                      <div className="flex h-screen overflow-hidden">
                        <Sidebar />
                        <div className="flex flex-col flex-1 min-h-0">
                          <Bookmarks_wrapper />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interests"
                  element={
                    <ProtectedRoute>
                      <div className="flex h-screen overflow-hidden">
                        <Sidebar />
                        <div className="flex flex-col flex-1 min-h-0">
                          <Interests_page />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
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
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit_profile"
                  element={
                    <ProtectedRoute>
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
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/content/:contentId"
                  element={
                    <ProtectedRoute>
                      <div className="flex h-screen overflow-hidden">
                        <Sidebar />
                        <div className="flex flex-col flex-1 min-h-0">
                          <ContentDetailPage />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/content/:contentId/comment/:commentId"
                  element={
                    <ProtectedRoute>
                      <div className="flex h-screen overflow-hidden">
                        <Sidebar />
                        <div className="flex flex-col flex-1 min-h-0">
                          <CommentThreadPage />
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit/:contentId"
                  element={
                    <ProtectedRoute>
                      <div className="flex h-screen overflow-hidden">
                        <Sidebar />
                        <div className="flex flex-col flex-1 min-h-0">
                          <div className="shrink-0">
                            <EditContentTopBar />
                          </div>
                          <div className="flex-1 min-h-0 overflow-y-auto">
                            <EditContentPage />
                          </div>
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <div className="flex h-screen overflow-hidden">
                        <Sidebar />
                        <div className="flex flex-col flex-1 min-h-0">
                          <div className="shrink-0">
                            <AdminTerminalTopBar />
                          </div>
                          <div className="flex-1 min-h-0 overflow-y-auto w-full">
                            <AdminTerminalPage />
                          </div>
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </BookmarksProvider>
        </SearchProvider>
      </SidebarProvider>
    </ProfileProvider>
  )
}

export default App