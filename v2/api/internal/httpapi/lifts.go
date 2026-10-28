package httpapi

import (
	"math"

	"github.com/jamesschuler/swol/v2/api/internal/db"
)

const maxWeight = 99999.99

func validateLift(weight float64, unit db.WeightUnit, reps int32) (float64, error) {
	rounded := math.Round(weight*100) / 100
	if rounded <= 0 || rounded > maxWeight {
		return 0, badRequest("weight must be between 0 and 99999.99")
	}
	if unit != db.WeightUnitLb && unit != db.WeightUnitKg {
		return 0, badRequest("unit must be lb or kg")
	}
	if reps < 1 || reps > 1000 {
		return 0, badRequest("reps must be 1-1000")
	}
	return rounded, nil
}
