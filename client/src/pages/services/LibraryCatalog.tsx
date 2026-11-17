import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { campusServices } from '../../services/campusServicesService';
import { ILibraryBook, IBookIssue } from '../../types/campusServices';
import { useAuth } from '../../context/AuthContext';
import {
  Book,
  Search,
  Library,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const LibraryCatalog: React.FC = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<ILibraryBook[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<IBookIssue[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const data = await campusServices.getBooks(search);
      setBooks(data);
      if (user?.role === 'STUDENT') {
        const borrowed = await campusServices.getMyBorrowedBooks();
        setBorrowedBooks(borrowed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCatalog();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-spsu-navy">Central Library & Reading Portal</h1>
            <span className="bg-blue-100 text-[#0057B8] border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={12} /> Release v7.0
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Search physical books, inspect live stack locations, and manage loan durations with automated fine tracking
          </p>
        </div>
      </div>

      {/* Currently Borrowed Books Section (for Student) */}
      {user?.role === 'STUDENT' && borrowedBooks.length > 0 && (
        <Card className="p-5 border-blue-200 bg-blue-50/30">
          <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
            <BookOpen size={16} className="text-[#0057B8]" />
            Your Currently Borrowed Books ({borrowedBooks.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {borrowedBooks.map((item) => (
              <div key={item._id} className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-xs flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{item.book?.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.book?.author}</p>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> Due: {new Date(item.dueDate).toLocaleDateString()}
                    </span>
                    {item.fineAmount > 0 && (
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
                        Fine: ₹{item.fineAmount}
                      </span>
                    )}
                  </div>
                </div>
                <span className="bg-blue-50 text-[#0057B8] border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by book title, author, ISBN, or subject..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
          />
        </div>
        <Button type="submit">Search Books</Button>
      </form>

      {/* Books Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading catalog...</div>
        ) : books.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No books found matching query.</div>
        ) : (
          books.map((b) => (
            <Card key={b._id} className="p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold text-[#0057B8] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                    {b.category}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      b.availableCopies > 0
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {b.availableCopies > 0 ? `${b.availableCopies} Available` : 'All Issued'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-base mt-2.5 line-clamp-2">{b.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{b.author}</p>
                <div className="mt-3 text-xs text-slate-600 space-y-1">
                  <p className="font-mono text-[11px]">ISBN: {b.isbn}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Library size={12} className="text-[#0057B8]" /> Location: {b.shelfLocation}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Total: {b.totalCopies} copies</span>
                <span className="text-xs text-[#0057B8] font-medium">Standard 14-Day Loan</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
