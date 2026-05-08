package store

type Store interface {
	GetActiveUserCount() (int, error)
}
